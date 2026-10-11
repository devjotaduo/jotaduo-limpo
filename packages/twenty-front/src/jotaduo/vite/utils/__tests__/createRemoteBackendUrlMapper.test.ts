import { createRemoteBackendUrlMapper } from '~/jotaduo/vite/utils/createRemoteBackendUrlMapper';

const mapper = createRemoteBackendUrlMapper({
  remoteOrigin: 'https://crm.example.com',
  localOrigin: 'http://localhost:3001',
});

describe('createRemoteBackendUrlMapper', () => {
  it('maps the dev server origin to the remote origin', () => {
    expect(mapper.toRemote('http://localhost:3001')).toBe(
      'https://crm.example.com',
    );
  });

  it('keeps the workspace subdomain when mapping to the remote', () => {
    expect(mapper.toRemote('{"origin":"http://apple.localhost:3001"}')).toBe(
      '{"origin":"https://apple.crm.example.com"}',
    );
  });

  it('keeps the workspace subdomain and the path when mapping to local', () => {
    expect(
      mapper.toLocal(
        '{"subdomainUrl":"https://apple.crm.example.com/","file":"https://crm.example.com/file/1"}',
      ),
    ).toBe(
      '{"subdomainUrl":"http://apple.localhost:3001/","file":"http://localhost:3001/file/1"}',
    );
  });

  it('leaves other origins alone', () => {
    expect(mapper.toRemote('https://evil.example.org')).toBe(
      'https://evil.example.org',
    );
    expect(mapper.toRemote('http://localhost:3000')).toBe(
      'http://localhost:3000',
    );
    expect(mapper.toLocal('https://example.com')).toBe('https://example.com');
  });

  it('does not treat a longer domain as the remote one', () => {
    expect(mapper.toLocal('https://crm.example.com.evil.org')).toBe(
      'https://crm.example.com.evil.org',
    );
    expect(mapper.toRemote('http://localhost:30011')).toBe(
      'http://localhost:30011',
    );
  });

  it('exposes both front domains', () => {
    expect(mapper.remoteFrontDomain).toBe('crm.example.com');
    expect(mapper.localFrontDomain).toBe('localhost');
  });
});
