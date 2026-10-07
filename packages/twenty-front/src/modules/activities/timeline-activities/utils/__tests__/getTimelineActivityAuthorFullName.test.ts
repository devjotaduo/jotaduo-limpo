import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { getTimelineActivityAuthorFullName } from '@/activities/timeline-activities/utils/getTimelineActivityAuthorFullName';
import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const CURRENT_WORKSPACE_MEMBER = { id: '123' } as CurrentWorkspaceMember;

const buildActor = (
  source: FieldActorValue['source'],
  name: string,
  workspaceMemberId: string | null = null,
): FieldActorValue => ({
  source,
  name,
  workspaceMemberId,
  context: {},
});

const getAuthorFullName = (event: object) =>
  getTimelineActivityAuthorFullName(
    event as TimelineActivity,
    CURRENT_WORKSPACE_MEMBER,
  );

describe('getTimelineActivityAuthorFullName', () => {
  it('should return "You" if the current workspace member is the author', () => {
    const event = {
      workspaceMember: {
        id: '123',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    };
    const currentWorkspaceMember = {
      id: '123',
    };

    const result = getTimelineActivityAuthorFullName(
      event as TimelineActivity,
      currentWorkspaceMember as CurrentWorkspaceMember,
    );

    expect(result).toBe('You');
  });

  it('should return the full name of the workspace member if they are not the current workspace member', () => {
    const event = {
      workspaceMember: {
        id: '456',
        name: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      },
    };
    const currentWorkspaceMember = {
      id: '123',
    };

    const result = getTimelineActivityAuthorFullName(
      event as TimelineActivity,
      currentWorkspaceMember as CurrentWorkspaceMember,
    );

    expect(result).toBe('Jane Smith');
  });

  it('should return "Twenty" if the workspace member is not defined', () => {
    const event = {};
    const currentWorkspaceMember = {
      id: '123',
    };

    const result = getTimelineActivityAuthorFullName(
      event as TimelineActivity,
      currentWorkspaceMember as CurrentWorkspaceMember,
    );

    expect(result).toBe('Twenty');
  });

  it('should prefer the workspace member over a stored actor', () => {
    const result = getAuthorFullName({
      workspaceMember: {
        id: '456',
        name: { firstName: 'Jane', lastName: 'Smith' },
      },
      properties: { actor: buildActor('APPLICATION', 'JotaDuo') },
    });

    expect(result).toBe('Jane Smith');
  });

  it.each([
    {
      level: 'properties.actor',
      event: { properties: { actor: buildActor('APPLICATION', 'JotaDuo') } },
      expected: 'JotaDuo',
    },
    {
      level: 'diff.updatedBy',
      event: {
        properties: {
          diff: {
            updatedBy: {
              before: buildActor('MANUAL', 'Jane Smith', '456'),
              after: buildActor('API', 'Zapier key'),
            },
          },
        },
      },
      expected: 'Zapier key',
    },
    {
      level: 'after.updatedBy',
      event: {
        properties: {
          after: { updatedBy: buildActor('WORKFLOW', 'Welcome flow') },
        },
      },
      expected: 'Welcome flow',
    },
    {
      level: 'after.createdBy',
      event: {
        properties: { after: { createdBy: buildActor('IMPORT', 'CSV file') } },
      },
      expected: 'CSV file',
    },
    {
      level: 'the activity createdBy',
      event: {
        properties: {},
        createdBy: buildActor('APPLICATION', 'JotaDuo'),
      },
      expected: 'JotaDuo',
    },
  ])(
    'should fall back to $level without a workspace member',
    ({ event, expected }) => {
      expect(getAuthorFullName(event)).toBe(expected);
    },
  );

  it('should take the first actor in fallback order', () => {
    const result = getAuthorFullName({
      properties: {
        actor: buildActor('AGENT', 'Sales agent'),
        diff: {
          updatedBy: {
            before: buildActor('MANUAL', 'Jane Smith', '456'),
            after: buildActor('API', 'Zapier key'),
          },
        },
        after: {
          updatedBy: buildActor('WORKFLOW', 'Welcome flow'),
          createdBy: buildActor('IMPORT', 'CSV file'),
        },
      },
      createdBy: buildActor('APPLICATION', 'JotaDuo'),
    });

    expect(result).toBe('Sales agent');
  });

  it('should skip MANUAL actors and actors without a name', () => {
    const result = getAuthorFullName({
      properties: {
        actor: buildActor('MANUAL', 'Jane Smith', '456'),
        diff: {
          updatedBy: {
            before: buildActor('MANUAL', 'Jane Smith', '456'),
            after: buildActor('APPLICATION', ' '),
          },
        },
        after: { updatedBy: buildActor('MANUAL', 'System') },
      },
      createdBy: buildActor('WEBHOOK', 'Stripe'),
    });

    expect(result).toBe('Stripe');
  });

  it('should return "Twenty" when no candidate is a named non-MANUAL actor', () => {
    const result = getAuthorFullName({
      properties: {
        actor: { name: 'Not an actor' },
        after: { updatedBy: buildActor('MANUAL', '') },
      },
      createdBy: buildActor('MANUAL', 'System'),
    });

    expect(result).toBe('Twenty');
  });
});
