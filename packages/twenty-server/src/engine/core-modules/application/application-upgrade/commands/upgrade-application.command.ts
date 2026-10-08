import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { askCommandConfirmation } from 'src/database/commands/utils/ask-command-confirmation.util';
import { parseBoundedPositiveInteger } from 'src/database/commands/utils/parse-bounded-positive-integer.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type UpgradeApplicationCommandOptions = {
  applicationRegistrationUniversalIdentifier: string;
  workspaceId?: Set<string>;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  yes?: boolean;
  sync?: boolean;
};

const MAX_WORKSPACE_COUNT_LIMIT = 50;

@Command({
  name: 'application:upgrade',
  description:
    'Enqueue one upgrade job per workspace to bring an application to its latest available version everywhere it is installed',
})
export class UpgradeApplicationCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationUpgradeService: ApplicationUpgradeService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags:
      '-u, --application-registration-universal-identifier <application_registration_universal_identifier>',
    description: 'Application registration universal identifier',
    required: true,
  })
  parseApplicationRegistrationUniversalIdentifier(value: string): string {
    return value;
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description:
      'Only upgrade the given workspace id. Can be repeated to target several workspaces. Upgrades all workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(value: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(value);

    return accumulator;
  }

  @Option({
    flags: '--workspace-count-limit <count>',
    description: `Limit the number of workspaces to upgrade (max ${MAX_WORKSPACE_COUNT_LIMIT})`,
    required: false,
  })
  parseWorkspaceCountLimit(value: string): number {
    return parseBoundedPositiveInteger(
      value,
      'workspace count limit',
      MAX_WORKSPACE_COUNT_LIMIT,
    );
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'List the workspaces that would be upgraded without upgrading',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-y, --yes',
    description: 'Skip the confirmation prompt (for non-interactive usage)',
    required: false,
  })
  parseYes(): boolean {
    return true;
  }

  @Option({
    flags: '--sync',
    description:
      'Upgrade the workspaces one after the other in this process instead of enqueuing jobs. Logs one result per workspace and exits with an error if any workspace fails',
    required: false,
  })
  parseSync(): boolean {
    return true;
  }

  override async run(
    _passedParams: string[],
    options: UpgradeApplicationCommandOptions,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: {
        universalIdentifier: options.applicationRegistrationUniversalIdentifier,
      },
    });

    if (!isDefined(registration)) {
      throw new Error(
        `Application registration with universal identifier ${options.applicationRegistrationUniversalIdentifier} not found`,
      );
    }

    const workspaceIds = isDefined(options.workspaceId)
      ? Array.from(options.workspaceId)
      : undefined;

    const {
      targetVersion,
      applicationsToUpgrade,
      skippedNonProvisionedWorkspaceIds,
      skippedIncompatibleWorkspaceIds,
    } = await this.applicationUpgradeService.findApplicationsToUpgrade({
      applicationRegistrationId: registration.id,
      onlyAutoUpgrade: false,
      workspaceIds,
      workspaceCountLimit: options.workspaceCountLimit,
    });

    if (!isDefined(targetVersion)) {
      this.logger.warn(
        `Application "${registration.name}" (${registration.universalIdentifier}) has no latest available version, nothing to upgrade`,
      );

      return;
    }

    if (skippedNonProvisionedWorkspaceIds.length > 0) {
      this.logger.warn(
        `Skipping ${skippedNonProvisionedWorkspaceIds.length} non provisioned workspace(s): ${skippedNonProvisionedWorkspaceIds.join(', ')}`,
      );
    }

    if (skippedIncompatibleWorkspaceIds.length > 0) {
      this.logger.warn(
        `Skipping ${skippedIncompatibleWorkspaceIds.length} workspace(s) that have not finished the server upgrade ${targetVersion} requires: ${skippedIncompatibleWorkspaceIds.join(', ')}`,
      );
    }

    const impactedWorkspaceIds = applicationsToUpgrade.map(
      (application) => application.workspaceId,
    );

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would enqueue an upgrade job for "${registration.name}" (${registration.universalIdentifier}) on ${impactedWorkspaceIds.length} workspace(s)${
          impactedWorkspaceIds.length > 0
            ? `: ${impactedWorkspaceIds.join(', ')}`
            : ''
        }. Jobs install the latest available version when they run, currently ${targetVersion}`,
      );

      return;
    }

    if (impactedWorkspaceIds.length === 0) {
      this.logger.log(
        `No workspace to upgrade, every targeted installation of "${registration.name}" already runs version ${targetVersion}`,
      );

      return;
    }

    const isSync = options.sync ?? false;

    if (!(options.yes ?? false)) {
      const confirmationTarget = isDefined(workspaceIds)
        ? `workspace(s) ${workspaceIds.join(', ')}`
        : `${impactedWorkspaceIds.length} workspace(s)`;

      const isConfirmed = await askCommandConfirmation(
        isSync
          ? `Confirm upgrading application ${registration.universalIdentifier} to version ${targetVersion} on ${confirmationTarget}, one workspace after the other in this process`
          : `Confirm enqueuing upgrade jobs for application ${registration.universalIdentifier} on ${confirmationTarget}. Jobs install the latest available version when they run, currently ${targetVersion}`,
      );

      if (!isConfirmed) {
        this.logger.log('Aborted, no upgrade enqueued');

        return;
      }
    }

    if (isSync) {
      await this.upgradeWorkspacesInProcess({
        registration,
        targetVersion,
        applications: applicationsToUpgrade,
      });

      return;
    }

    const enqueuedJobIds =
      await this.applicationUpgradeService.enqueueWorkspaceApplicationUpgrades({
        applicationRegistrationId: registration.id,
        applications: applicationsToUpgrade,
        onlyAutoUpgrade: false,
      });

    this.logger.log(
      `Enqueued ${enqueuedJobIds.length} upgrade job(s) on ${MessageQueue.applicationUpgradeQueue} for "${registration.name}" (${registration.universalIdentifier}) on ${impactedWorkspaceIds.length} workspace(s). Jobs install the latest available version when they run, currently ${targetVersion}`,
    );

    this.logger.log(chalk.blue('Command completed!'));
  }

  // One workspace failing must not stop the others: every workspace gets its
  // own result line, and the failure count decides the exit code at the end.
  private async upgradeWorkspacesInProcess({
    registration,
    targetVersion,
    applications,
  }: {
    registration: ApplicationRegistrationEntity;
    targetVersion: string;
    applications: ApplicationEntity[];
  }): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      select: ['id', 'subdomain'],
      where: {
        id: In(applications.map((application) => application.workspaceId)),
      },
    });

    const subdomainByWorkspaceId = new Map(
      workspaces.map((workspace) => [workspace.id, workspace.subdomain]),
    );

    let failureCount = 0;

    for (const { workspaceId, version } of applications) {
      const logFields = {
        applicationUniversalIdentifier: registration.universalIdentifier,
        workspaceId,
        subdomain: subdomainByWorkspaceId.get(workspaceId),
        fromVersion: version,
        toVersion: targetVersion,
      };

      try {
        await this.applicationUpgradeService.upgradeApplication({
          appRegistrationId: registration.id,
          targetVersion,
          workspaceId,
        });

        this.logger.log(
          formatUpgradeLog({
            humanMessage: `Upgraded "${registration.name}" on workspace ${workspaceId} from ${version} to ${targetVersion}`,
            event: 'application.upgrade.success',
            logFields,
          }),
        );
      } catch (error) {
        failureCount += 1;

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.error(
          formatUpgradeLog({
            humanMessage: `Failed to upgrade "${registration.name}" on workspace ${workspaceId} from ${version} to ${targetVersion}: ${errorMessage}`,
            event: 'application.upgrade.failed',
            logFields: { ...logFields, error: errorMessage },
          }),
        );
      }
    }

    this.logger.log(
      formatUpgradeLog({
        humanMessage: `Upgrade summary for "${registration.name}" version ${targetVersion}: ${applications.length - failureCount} workspace(s) succeeded, ${failureCount} workspace(s) failed`,
        event: 'application.upgrade.summary',
        logFields: {
          applicationUniversalIdentifier: registration.universalIdentifier,
          toVersion: targetVersion,
          totalSuccesses: applications.length - failureCount,
          totalFailures: failureCount,
        },
      }),
    );

    // The command bootstrap turns a thrown error into exit code 1.
    if (failureCount > 0) {
      throw new Error(
        `Application upgrade completed with ${failureCount} workspace failure(s)`,
      );
    }

    this.logger.log(chalk.blue('Command completed!'));
  }
}
