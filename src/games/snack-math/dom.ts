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

function center(r: DOMRect) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Move an element to a new parent, animating it from where it was on screen. */
export function flipMove(el: HTMLElement, parent: HTMLElement, ms = 320) {
  const from = center(el.getBoundingClientRect());
  el.classList.remove('dragging');
  el.style.transition = 'none';
  el.style.transform = '';
  parent.append(el);
  const to = center(el.getBoundingClientRect());
  el.style.transform = `translate(${from.x - to.x}px, ${from.y - to.y}px)`;
  void el.offsetWidth;
  el.style.transition = `transform ${ms}ms cubic-bezier(.3,1.4,.5,1)`;
  el.style.transform = '';
}

/** Animate an element flying into another element's centre while shrinking away. */
export function flyInto(el: HTMLElement, target: HTMLElement, ms = 380) {
  const from = center(el.getBoundingClientRect());
  const to = center(target.getBoundingClientRect());
  el.style.transition = `transform ${ms}ms ease-in, opacity ${ms}ms ease-in`;
  el.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(0.3)`;
  el.style.opacity = '0';
  return wait(ms);
}

export function inside(x: number, y: number, el: Element, slop = 0) {
  const r = el.getBoundingClientRect();
  return x >= r.left - slop && x <= r.right + slop && y >= r.top - slop && y <= r.bottom + slop;
}

/**
 * Let an element be dragged or tapped. A tap, or a drop where `accepts` says yes, calls `onPlace`;
 * any other drop springs the element back.
 */
export function dragOrTap(
  el: HTMLElement,
  accepts: (x: number, y: number) => boolean,
  onPlace: () => void,
): () => void {
  const ctl = new AbortController();
  const opts = { signal: ctl.signal };
  let pointer: number | null = null;
  let sx = 0;
  let sy = 0;
  let dragging = false;

  const springBack = () => {
    el.classList.remove('dragging', 'held');
    el.style.transition = 'transform 260ms cubic-bezier(.3,1.4,.5,1)';
    el.style.transform = '';
  };

  el.addEventListener('pointerdown', (e) => {
    if (pointer !== null) return;
    pointer = e.pointerId;
    el.setPointerCapture(e.pointerId);
    sx = e.clientX;
    sy = e.clientY;
    dragging = false;
    el.classList.add('held');
  }, opts);

  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointer) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (!dragging && Math.hypot(dx, dy) > 10) {
      dragging = true;
      el.classList.add('dragging');
      el.style.transition = 'none';
    }
    if (dragging) el.style.transform = `translate(${dx}px, ${dy}px) scale(1.25)`;
  }, opts);

  el.addEventListener('pointerup', (e) => {
    if (e.pointerId !== pointer) return;
    pointer = null;
    el.classList.remove('held');
    if (!dragging || accepts(e.clientX, e.clientY)) {
      ctl.abort();
      onPlace();
    } else {
      springBack();
    }
  }, opts);

  el.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== pointer) return;
    pointer = null;
    springBack();
  }, opts);

  return () => ctl.abort();
}

/** Fire `onDone` only after the element is held down for `ms`. Adds `holding` while pressed. */
export function holdToActivate(el: HTMLElement, ms: number, onDone: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => {
    clearTimeout(timer);
    el.classList.remove('holding');
  };
  el.style.setProperty('--hold-ms', `${ms}ms`);
  el.addEventListener('pointerdown', (e) => {
    el.setPointerCapture(e.pointerId);
    el.classList.add('holding');
    timer = setTimeout(() => {
      cancel();
      onDone();
    }, ms);
  });
  el.addEventListener('pointerup', cancel);
  el.addEventListener('pointercancel', cancel);
}

export function sparkle(from: HTMLElement, layer: HTMLElement, glyphs = ['✨', '💛', '⭐'], count = 10) {
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
