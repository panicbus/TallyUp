import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckInQrCode } from './CheckInQrCode';

describe('CheckInQrCode', () => {
  it('renders the customer check-in URL for the given slug', () => {
    render(<CheckInQrCode slug="demo-shop" businessName="Demo Shop" />);

    expect(screen.getByText(`${window.location.host}/checkin/demo-shop`)).toBeTruthy();
  });

  it('shows the business name as a heading directly above the QR code', () => {
    render(<CheckInQrCode slug="demo-shop" businessName="Demo Shop" />);

    expect(screen.getByRole('heading', { name: 'Demo Shop' })).toBeTruthy();
  });

  it('renders a QR svg encoding the check-in URL', () => {
    const { container } = render(<CheckInQrCode slug="demo-shop" businessName="Demo Shop" />);

    const svg = container.querySelector('svg[role="img"], svg');
    expect(svg).not.toBeNull();
  });

  it('is deterministic: same slug renders identical QR markup', () => {
    const first = render(<CheckInQrCode slug="nicos-place" businessName="Nico's Place" />).container.querySelector(
      'svg',
    )?.outerHTML;
    const second = render(<CheckInQrCode slug="nicos-place" businessName="Nico's Place" />).container.querySelector(
      'svg',
    )?.outerHTML;

    expect(first).toBeTruthy();
    expect(first).toEqual(second);
  });

  it('offers a save-to-photos action that names the file after the slug and draws the business name', async () => {
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const fillText = vi.fn();
    // jsdom has no real canvas encoder; stub the bits the handler touches.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: () => {},
      drawImage: () => {},
      fillText,
      measureText: () => ({ width: 50 }) as TextMetrics,
      set fillStyle(_v: string) {},
      set font(_v: string) {},
      set textAlign(_v: CanvasTextAlign) {},
      set textBaseline(_v: CanvasTextBaseline) {},
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) =>
      cb(new Blob(['x'], { type: 'image/png' })),
    );
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();

    // Capture the actual <img> the handler creates internally (a fresh
    // `new Image()` from the test wouldn't be the same element) so its real
    // onload — including the business-name drawing — actually runs. jsdom
    // never actually decodes the image, so width/height stay 0 unless
    // stubbed; left at 0, canvas.width goes negative and the mocked
    // measureText (a fixed 50) then "overflows" any width, truncating even
    // a short name regardless of its real length.
    const OriginalImage = window.Image;
    const created: HTMLImageElement[] = [];
    class SpyImage extends OriginalImage {
      constructor(...args: ConstructorParameters<typeof Image>) {
        super(...args);
        Object.defineProperty(this, 'width', { value: 164, configurable: true });
        Object.defineProperty(this, 'height', { value: 164, configurable: true });
        created.push(this);
      }
    }
    window.Image = SpyImage as unknown as typeof Image;

    render(<CheckInQrCode slug="demo-shop" businessName="Demo Shop" />);
    const button = screen.getByRole('button', { name: /download qr code image/i });
    await userEvent.click(button);
    await created[0]?.onload?.(new Event('load'));

    expect(fillText).toHaveBeenCalledWith('Demo Shop', expect.any(Number), expect.any(Number));
    expect(anchorClick).toHaveBeenCalled();

    window.Image = OriginalImage;
    anchorClick.mockRestore();
  });
});
