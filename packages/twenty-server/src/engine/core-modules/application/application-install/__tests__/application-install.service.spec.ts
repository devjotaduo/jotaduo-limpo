import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const REGISTRATION_ID = 'registration-id';
const WORKSPACE_ID = 'workspace-id';

describe('ApplicationInstallService - new installation', () => {
  let service: ApplicationInstallService;
  let appRegistrationRepository: { findOne: jest.Mock };
  let applicationService: { create: jest.Mock };

  beforeEach(async () => {
    appRegistrationRepository = { findOne: jest.fn() };

    // Stops the install right after the application row is created: the
    // steps that follow are not what these tests cover.
    applicationService = {
      create: jest
        .fn()
        .mockRejectedValue(
          new Error('Stopped after creating the application row'),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationInstallService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: appRegistrationRepository,
        },
        { provide: ApplicationService, useValue: applicationService },
        {
          provide: ApplicationLookupService,
          useValue: {
            findByUniversalIdentifier: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: ApplicationPackageFetcherService,
          useValue: {
            resolvePackage: jest.fn().mockResolvedValue({
              manifest: {
                application: {
                  universalIdentifier: 'jotaduo-universal-identifier',
                  displayName: 'JotaDuo',
                },
              },
              packageJson: { version: '1.0.0' },
              extractedDir: '/tmp/jotaduo',
              cleanupDir: '/tmp/jotaduo',
            }),
            cleanupExtractedDir: jest.fn(),
          },
        },
        { provide: ApplicationVersionValidationService, useValue: {} },
        { provide: ApplicationSyncService, useValue: {} },
        { provide: ApplicationManifestApplyService, useValue: {} },
        { provide: FileStorageService, useValue: {} },
        { provide: LogicFunctionExecutorService, useValue: {} },
        {
          provide: CacheLockService,
          useValue: { withLock: jest.fn((callback) => callback()) },
        },
        {
          provide: getQueueToken(MessageQueue.applicationLifecycleHookQueue),
          useValue: {},
        },
        { provide: getQueueToken(MessageQueue.workspaceQueue), useValue: {} },
        { provide: WorkspaceCacheService, useValue: {} },
        {
          provide: MetricsService,
          useValue: { incrementCounterBy: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ApplicationInstallService>(ApplicationInstallService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const installApplicationOnNewWorkspace = async ({
    isPreInstalled,
  }: {
    isPreInstalled: boolean;
  }) => {
    appRegistrationRepository.findOne.mockResolvedValue({
      id: REGISTRATION_ID,
      universalIdentifier: 'jotaduo-universal-identifier',
      name: 'JotaDuo',
      sourceType: ApplicationRegistrationSourceType.TARBALL,
      manifest: null,
      isPreInstalled,
    });

    await expect(
      service.installApplication({
        appRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        skipWorkspaceCompatibilityCheck: true,
      }),
    ).rejects.toThrow('Stopped after creating the application row');
  };

  it('turns auto upgrade on for an installation of a pre-installed application', async () => {
    await installApplicationOnNewWorkspace({ isPreInstalled: true });

    expect(applicationService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        autoUpgrade: true,
      }),
    );
  });

  it('keeps auto upgrade off for an installation of any other application', async () => {
    await installApplicationOnNewWorkspace({ isPreInstalled: false });

    expect(applicationService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        autoUpgrade: false,
      }),
    );
  });
});
