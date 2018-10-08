// This file implements Bae and Takaoka's algorithm
// to solve the K-Maximum subarray problem.
// https://core.ac.uk/download/pdf/35457835.pdf

import _ from 'lodash';
import quickselect from 'quickselect';
import Heap from 'heap';

// Adapted from the default compare function from the
// quickselect repo. Reversed so that all items in the
// [left, k] are the *largest*.
// https://github.com/mourner/quickselect/blob/5a50037385182fbd23cd5fc8123834361df17b73/index.js#L52
function maxCmp(a, b) {
  return a > b ? -1 : a < b ? 1 : 0;
}

function maxCmpObj(a, b) {
  return maxCmp(a.val, b.val);
}

function maxQuickselect(L, k, cmp = maxCmp) {
  quickselect(L, k, 0, L.length - 1, cmp);
}

// Algorithm 2: Select k largest elements of L.
// Mutates L.
// Exported for tests.
// O(n)
export function kLargest(k, L, cmp = maxCmp) {
  const n = L.length;
  if (k >= n) return L;
  maxQuickselect(L, k, cmp);
  return _.take(L, k);
}

// Algorithm 5: Gets K max sums and their start/end indices from input.
// Returns array of objects with the shape { val: <sum>, start: int, end: int }
// Start and end indices are both inclusive.
// Exported for tests.
// O(n log K + K^2)
export function kMaxRanges(K, input) {
  const n = input.length;
  if (K < 1 || K > n) {
    console.error('1 <= K <= n but K =', K, 'and n =', n);
    return undefined;
  }

  const sum = new Array(n + 1);
  sum[0] = { val: 0, start: -1, end: -1 };

  // Pre-process: sampling
  // O(n)
  let sumMin = 0;
  const sample = new Array(n);
  for (let i = 0; i < n; i++) {
    const val = sum[i].val + input[i];
    const thisSum = { val, start: 0, end: i };
    sum[i + 1] = thisSum;

    // Sample for initial K large values
    sample[i] = val - sumMin;
    if (val < sumMin) {
      sumMin = val;
    }
  }

  // O(n)
  maxQuickselect(sample, K);
  const kthSample = sample[K];

  // Store mins in a max-heap.
  //
  // The paper recommends a 2-3 tree for O(log K) access, O(K)
  // sequential read by DFS, O(log K) insertions, and O(log K)
  // deletions of the max item.
  //
  // Using a max-heap, we get O(log K) search, O(K) sequential read,
  // O(log K) insertions, O(log K) replacements, and O(log K)
  // deletions of the max item.
  //
  // So it seems just as good.
  const min = new Heap((a, b) => a.val - b.val);

  // Candidate generation and selection
  min.push(sum[0]);
  let M = [sum[0]];
  for (let i = 0; i < n; i++) {
    const thisSum = sum[i + 1];

    // As this block is run K times total during the n outer loop
    // interations, the time complexity of this if block across all n
    // outer loop iterations is O(K^2).
    if (thisSum.val - min.peek().val >= kthSample) {
      // Part 1
      // O(K)
      const cand = min
        .toArray()
        .map((a) => ({ val: thisSum.val - a.val, start: a.end + 1, end: thisSum.end }));
      M = kLargest(K, M.concat(cand), maxCmpObj);
    }

    // Part 2: Add/replace sum in heap
    // O(log K)
    if (min.size() > K) {
      // Replace max in heap if the new val is smaller
      if (thisSum.val <= min.peek().val) {
        min.replace(thisSum);
      }
    } else {
      min.push(thisSum);
    }
  }

  return M;
}

// TODO: Implement fn to generate best times from ShowFace responses.
