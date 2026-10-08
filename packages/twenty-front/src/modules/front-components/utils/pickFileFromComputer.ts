import { isNonEmptyString } from '@sniptt/guards';

// The value comes from a sandboxed front component; real accept lists are far shorter.
const FILE_PICKER_ACCEPT_MAX_LENGTH = 1024;

export const pickFileFromComputer = ({
  accept,
}: {
  accept?: string;
} = {}): Promise<File | null> =>
  new Promise((resolve, reject) => {
    // Without a recent user gesture the browser ignores click() and fires neither change nor cancel, so the promise would never settle.
    if (navigator.userActivation?.isActive === false) {
      reject(
        new DOMException(
          'Opening the file picker requires a user gesture',
          'NotAllowedError',
        ),
      );

      return;
    }

    const input = document.createElement('input');

    input.type = 'file';
    input.hidden = true;

    if (isNonEmptyString(accept)) {
      input.accept = accept.slice(0, FILE_PICKER_ACCEPT_MAX_LENGTH);
    }

    const settle = (file: File | null) => {
      input.remove();
      resolve(file);
    };

    input.addEventListener('change', () => settle(input.files?.[0] ?? null), {
      once: true,
    });
    input.addEventListener('cancel', () => settle(null), { once: true });

    document.body.append(input);

    try {
      input.click();
    } catch (error) {
      input.remove();
      reject(error);
    }
  });
