export interface Friend {
  name: string;
  emoji: string;
  snack: { emoji: string; one: string; many: string };
}

export const FRIENDS: readonly Friend[] = [
  { name: 'Bunny', emoji: '🐰', snack: { emoji: '🥕', one: 'carrot', many: 'carrots' } },
  { name: 'Monkey', emoji: '🐵', snack: { emoji: '🍌', one: 'banana', many: 'bananas' } },
  { name: 'Dog', emoji: '🐶', snack: { emoji: '🦴', one: 'bone', many: 'bones' } },
  { name: 'Cat', emoji: '🐱', snack: { emoji: '🐟', one: 'fish', many: 'fish' } },
  { name: 'Bear', emoji: '🐻', snack: { emoji: '🍯', one: 'honey pot', many: 'honey pots' } },
  { name: 'Mouse', emoji: '🐭', snack: { emoji: '🧀', one: 'piece of cheese', many: 'pieces of cheese' } },
];

export function snackWord(friend: Friend, n: number): string {
  return n === 1 ? friend.snack.one : friend.snack.many;
}
