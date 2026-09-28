type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: { class?: string; text?: string; label?: string; html?: string } = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.html !== undefined) el.innerHTML = props.html;
  if (props.label) el.setAttribute('aria-label', props.label);
  if (tag === 'button') el.setAttribute('type', 'button');
  for (const c of children) if (c) el.append(c);
  return el;
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Runs a one-shot animation class again, even if it's still on. */
export function replay(el: Element, className: string): void {
  el.classList.remove(className);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(className);
}

export function sparkle(at: { x: number; y: number }, layer: HTMLElement, glyphs = ['✨', '💛', '⭐'], count = 8): void {
  for (let i = 0; i < count; i++) {
    const s = h('span', { class: 'sparkle', text: glyphs[i % glyphs.length] });
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 50 + Math.random() * 40;
    s.style.left = `${at.x}px`;
    s.style.top = `${at.y}px`;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    layer.append(s);
    setTimeout(() => s.remove(), 1000);
  }
}
