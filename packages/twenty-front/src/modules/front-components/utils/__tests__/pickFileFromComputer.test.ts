import { fireEvent } from '@testing-library/react';

import { pickFileFromComputer } from '@/front-components/utils/pickFileFromComputer';

const getFileInput = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]');

describe('pickFileFromComputer', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'userActivation');
  });

  it('should resolve with the chosen file and remove the input', async () => {
    const file = new File(['content'], 'contract.pdf', {
      type: 'application/pdf',
    });

    const pickedFilePromise = pickFileFromComputer();
    const fileInput = getFileInput();

    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [file] },
    });

    await expect(pickedFilePromise).resolves.toBe(file);
    expect(getFileInput()).toBeNull();
  });

  it('should resolve with null when the picker is cancelled', async () => {
    const pickedFilePromise = pickFileFromComputer();

    fireEvent(getFileInput() as HTMLInputElement, new Event('cancel'));

    await expect(pickedFilePromise).resolves.toBeNull();
    expect(getFileInput()).toBeNull();
  });

  it('should cap the accept filter length', async () => {
    const pickedFilePromise = pickFileFromComputer({
      accept: `image/*,${'.x'.repeat(1000)}`,
    });
    const fileInput = getFileInput() as HTMLInputElement;

    expect(fileInput.accept.startsWith('image/*,')).toBe(true);
    expect(fileInput.accept).toHaveLength(1024);

    fireEvent(fileInput, new Event('cancel'));
    await pickedFilePromise;
  });

  it('should reject without adding an input when there is no user gesture', async () => {
    Object.defineProperty(navigator, 'userActivation', {
      value: { isActive: false },
      configurable: true,
    });

    await expect(pickFileFromComputer()).rejects.toMatchObject({
      name: 'NotAllowedError',
    });
    expect(getFileInput()).toBeNull();
  });
});
