import { Logger } from '@nestjs/common';

import { type Repository } from 'typeorm';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { UpgradeApplicationCommand } from 'src/engine/core-modules/application/application-upgrade/commands/upgrade-application.command';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const REGISTRATION = {
  id: 'registration-id',
  name: 'JotaDuo',
  universalIdentifier: 'jotaduo-universal-identifier',
} as ApplicationRegistrationEntity;

const APPLICATIONS_TO_UPGRADE = [
  { workspaceId: 'workspace-a', version: '1.0.0' },
  { workspaceId: 'workspace-b', version: '1.1.0' },
  { workspaceId: 'workspace-c', version: null },
] as ApplicationEntity[];

describe('UpgradeApplicationCommand', () => {
  const applicationRegistrationRepository = {
    findOne: jest.fn(),
  };

  const applicationUpgradeService = {
    findApplicationsToUpgrade: jest.fn(),
    enqueueWorkspaceApplicationUpgrades: jest.fn(),
    upgradeApplication: jest.fn(),
  };

  const workspaceRepository = {
    find: jest.fn(),
  };

  const command = new UpgradeApplicationCommand(
    applicationRegistrationRepository as unknown as Repository<ApplicationRegistrationEntity>,
    applicationUpgradeService as unknown as ApplicationUpgradeService,
    workspaceRepository as unknown as Repository<WorkspaceEntity>,
  );

  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  const loggedMessages = (spy: jest.SpyInstance): string[] =>
    spy.mock.calls.map(([message]) => String(message));

  const findResultLine = (
    spy: jest.SpyInstance,
    workspaceId: string,
  ): string | undefined =>
    loggedMessages(spy)
      .flatMap((message) => message.split('\n'))
      .find(
        (line) =>
          line.startsWith('[upgrade] event=application.upgrade.') &&
          line.includes(`workspaceId=${workspaceId} `),
      );

  beforeEach(() => {
    jest.clearAllMocks();

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    applicationRegistrationRepository.findOne.mockResolvedValue(REGISTRATION);
    applicationUpgradeService.findApplicationsToUpgrade.mockResolvedValue({
      appRegistration: REGISTRATION,
      targetVersion: '2.0.0',
      applicationsToUpgrade: APPLICATIONS_TO_UPGRADE,
      skippedNonProvisionedWorkspaceIds: [],
      skippedIncompatibleWorkspaceIds: [],
    });
    applicationUpgradeService.enqueueWorkspaceApplicationUpgrades.mockResolvedValue(
      ['job-a', 'job-b', 'job-c'],
    );
    applicationUpgradeService.upgradeApplication.mockResolvedValue(true);
    workspaceRepository.find.mockResolvedValue([
      { id: 'workspace-a', subdomain: 'acme' },
      { id: 'workspace-b', subdomain: 'globex' },
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('enqueues the upgrade jobs and upgrades nothing in process without --sync', async () => {
    await command.run([], {
      applicationRegistrationUniversalIdentifier:
        REGISTRATION.universalIdentifier,
      yes: true,
    });

    expect(
      applicationUpgradeService.enqueueWorkspaceApplicationUpgrades,
    ).toHaveBeenCalledWith({
      applicationRegistrationId: REGISTRATION.id,
      applications: APPLICATIONS_TO_UPGRADE,
      onlyAutoUpgrade: false,
    });
    expect(applicationUpgradeService.upgradeApplication).not.toHaveBeenCalled();
    expect(
      loggedMessages(logSpy).some((message) =>
        message.includes('[upgrade] event=application.upgrade.'),
      ),
    ).toBe(false);
  });

  it('upgrades every workspace in process with --sync and logs one success line per workspace', async () => {
    await command.run([], {
      applicationRegistrationUniversalIdentifier:
        REGISTRATION.universalIdentifier,
      yes: true,
      sync: true,
    });

    expect(
      applicationUpgradeService.enqueueWorkspaceApplicationUpgrades,
    ).not.toHaveBeenCalled();
    expect(
      applicationUpgradeService.upgradeApplication.mock.calls.map(
        ([params]) => params,
      ),
    ).toEqual(
      ['workspace-a', 'workspace-b', 'workspace-c'].map((workspaceId) => ({
        appRegistrationId: REGISTRATION.id,
        targetVersion: '2.0.0',
        workspaceId,
      })),
    );

    expect(findResultLine(logSpy, 'workspace-a')).toBe(
      '[upgrade] event=application.upgrade.success applicationUniversalIdentifier=jotaduo-universal-identifier workspaceId=workspace-a subdomain=acme fromVersion=1.0.0 toVersion=2.0.0',
    );
    expect(findResultLine(logSpy, 'workspace-b')).toBe(
      '[upgrade] event=application.upgrade.success applicationUniversalIdentifier=jotaduo-universal-identifier workspaceId=workspace-b subdomain=globex fromVersion=1.1.0 toVersion=2.0.0',
    );
    expect(findResultLine(logSpy, 'workspace-c')).toBe(
      '[upgrade] event=application.upgrade.success applicationUniversalIdentifier=jotaduo-universal-identifier workspaceId=workspace-c subdomain=undefined fromVersion=null toVersion=2.0.0',
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('keeps going after a failed workspace, logs the error on its line and rejects so the command exits with an error', async () => {
    applicationUpgradeService.upgradeApplication.mockImplementation(
      async ({ workspaceId }: { workspaceId: string }) => {
        if (workspaceId === 'workspace-b') {
          throw new ApplicationException(
            'Workspace "globex" has not finished the server upgrade',
            ApplicationExceptionCode.UPGRADE_FAILED,
          );
        }

        return true;
      },
    );

    await expect(
      command.run([], {
        applicationRegistrationUniversalIdentifier:
          REGISTRATION.universalIdentifier,
        yes: true,
        sync: true,
      }),
    ).rejects.toThrow(
      'Application upgrade completed with 1 workspace failure(s)',
    );

    expect(applicationUpgradeService.upgradeApplication).toHaveBeenCalledTimes(
      3,
    );
    expect(findResultLine(logSpy, 'workspace-a')).toContain(
      'event=application.upgrade.success',
    );
    expect(findResultLine(logSpy, 'workspace-c')).toContain(
      'event=application.upgrade.success',
    );
    expect(findResultLine(errorSpy, 'workspace-b')).toBe(
      '[upgrade] event=application.upgrade.failed applicationUniversalIdentifier=jotaduo-universal-identifier workspaceId=workspace-b subdomain=globex fromVersion=1.1.0 toVersion=2.0.0 error="Workspace \\"globex\\" has not finished the server upgrade"',
    );
    expect(
      loggedMessages(logSpy).some((message) =>
        message.includes(
          '[upgrade] event=application.upgrade.summary applicationUniversalIdentifier=jotaduo-universal-identifier toVersion=2.0.0 totalSuccesses=2 totalFailures=1',
        ),
      ),
    ).toBe(true);
  });

  it('does not upgrade anything with --sync when the dry run flag is set', async () => {
    await command.run([], {
      applicationRegistrationUniversalIdentifier:
        REGISTRATION.universalIdentifier,
      dryRun: true,
      sync: true,
    });

    expect(applicationUpgradeService.upgradeApplication).not.toHaveBeenCalled();
    expect(
      applicationUpgradeService.enqueueWorkspaceApplicationUpgrades,
    ).not.toHaveBeenCalled();
  });
});
