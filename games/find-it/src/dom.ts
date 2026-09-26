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

export function sparkle(from: HTMLElement, layer: HTMLElement, glyphs = ['✨', '💛', '⭐'], count = 10): void {
  const r = from.getBoundingClientRect();
  const base = layer.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const s = h('span', { class: 'sparkle', text: glyphs[i % glyphs.length] });
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 70 + Math.random() * 60;
    s.style.left = `${r.left - base.left + r.width / 2}px`;
    s.style.top = `${r.top - base.top + r.height / 2}px`;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    layer.append(s);
    setTimeout(() => s.remove(), 1000);
  }
}
