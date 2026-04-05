/**
 * Returns a DOMRect adjusted for CSS `zoom` applied to the <html> element.
 *
 * When `zoom` is set on `html`, `getBoundingClientRect()` returns coordinates
 * in the zoomed layout space, but `position: fixed` elements are placed in the
 * *unzoomed* viewport space. Dividing by the zoom factor corrects the mismatch.
 *
 * @param {Element} el
 * @returns {{ top: number, bottom: number, left: number, right: number, width: number, height: number }}
 */
export function getZoomAwareRect(el) {
  const rect = el.getBoundingClientRect()
  // Read zoom from the html element (Chrome/Edge support). Fallback to 1.
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1
  return {
    top: rect.top / zoom,
    bottom: rect.bottom / zoom,
    left: rect.left / zoom,
    right: rect.right / zoom,
    width: rect.width / zoom,
    height: rect.height / zoom,
  }
}
