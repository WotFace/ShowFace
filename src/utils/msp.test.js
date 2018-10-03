// This file implements Bae and Takaoka's algorithm
// to solve the K-Maximum subarray problem.
// https://core.ac.uk/download/pdf/35457835.pdf

import _ from 'lodash';
import quickselect from 'quickselect';
import Heap from 'heap';

function maxQuickselect(L, k) {
  // Adapted from the default compare function from the
  // quickselect repo. Reversed so that all items in the
  // [left, k] are the *largest*.
  // https://github.com/mourner/quickselect/blob/5a50037385182fbd23cd5fc8123834361df17b73/index.js#L52
  function maxCmp(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
  }

  quickselect(L, k, 0, L.length - 1, maxCmp);
}

// Algorithm 2: Select k largest elements of L.
// Mutates L.
// O(n)
function kLargest(k, L) {
  const n = L.length;
  if (k >= n) return L;
  maxQuickselect(L, k);
  return _.take(L, k);
}

test('kLargest', () => {
  // Array of tests in the format [k, test, expectedResults]
  const tests = [
    [1, [], []], // Empty array
    [1000, [9, 7, 4], [4, 7, 9]], // k > n
    [3, [9, 7, 4], [4, 7, 9]], // k = n
    [2, [7, 10, 10, 9, 7, 4], [10, 10]], // Duplicates
    [3, [7, 10, 10, 9, 7, 4], [9, 10, 10]],
    [2, [4, 5, 6, 9, 7, 10], [9, 10]], // Does not simply sort lowest k elements
  ];
  tests.forEach(([k, t, r]) => {
    const res = _.sortBy(kLargest(k, t));
    expect(res).toEqual(r);
  });
});

// Algorithm 5: Gets K max sums from input.
// O(n log K + K^2)
function kMaxSums(K, input) {
  const n = input.length;
  if (K < 1 || K > n) {
    console.log('1 <= K <= n but K =', K, 'and n =', n);
    return undefined;
  }

  const sum = new Array(n + 1);
  let M = [0];

  sum[0] = 0;
  let sumMin = 0;

  // Pre-process: sampling
  // O(n)
  const sample = new Array(n);
  for (let i = 0; i < n; i++) {
    const thisSum = sum[i] + input[i];
    sum[i + 1] = thisSum;
    // Sample for initial K large values
    sample[i] = thisSum - sumMin;
    if (thisSum < sumMin) {
      sumMin = thisSum;
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
  const min = new Heap((a, b) => a - b);

  // Candidate generation and selection
  min.push(0);
  for (let i = 0; i < n; i++) {
    const thisSum = sum[i + 1];

    // As this block is run K times total during the n outer loop
    // interations, the time complexity of this if block across all n
    // outer loop iterations is O(K^2).
    if (thisSum - min.peek() >= kthSample) {
      // Part 1
      // O(K)
      const cand = min.toArray().map((a) => thisSum - a);
      M = kLargest(K, M.concat(cand));
    }

    // Part 2: Add/replace sum in heap
    // O(log K)
    if (min.size() > K) {
      // Replace max in heap if the new val is smaller
      if (thisSum <= min.peek()) {
        min.replace(thisSum);
      }
    } else {
      min.push(thisSum);
    }
  }

  return M;
}

test('kMaxSums', () => {
  // TODO: Add test for K > n and K < 1

  // Array of tests in the format [K, test, expectedResults]
  const tests = [
    // [3, [9, 7, 4], [7 + 4, 9 + 7, 9 + 7 + 4]], // k = n
    [2, [9, 7, 4], [9 + 7, 9 + 7 + 4]], // k < n
    [2, [4, 7, 9], [9 + 7, 9 + 7 + 4]], // k < n
    [4, [1, -23, 3, 4, 39, 9, 8, 8, 7, 4], [75, 78, 79, 82]],
  ];

  tests.forEach(([K, t, r]) => {
    const res = _.sortBy(kMaxSums(K, t));
    expect(res).toEqual(r);
  });
});

function perfTester() {
  const ns = _.times(4, (a) => Math.pow(10, a + 2));
  const repeats = 5;

  const ks = _.times(4, (a) => Math.pow(10, a + 1));

  ns.forEach((n) => {
    const input = _.times(n, () => _.random(-1000, 1000));

    ks.forEach((k) => {
      if (k > n) return;

      console.time(`n=${n} k=${k}`);
      _.times(repeats, () => kMaxSums(k, input));
      console.timeEnd(`n=${n} k=${k}`);
    });
  });
}

// test.skip('perf', () => {
// perfTester();
// });
