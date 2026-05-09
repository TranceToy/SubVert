export function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function shuffledIndices(n) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(i);
  return shuffleInPlace(arr);
}
