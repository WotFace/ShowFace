// This file implements Bae and Takaoka's algorithm
// to solve the K-Maximum subarray problem.
// https://core.ac.uk/download/pdf/35457835.pdf

import _ from 'lodash';
import { kLargest, kMaxRanges } from './bestTime';

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

test('kMaxRanges', () => {
  // TODO: Add test for K > n and K < 1

  // Array of tests. kMaxRanges(K, t) should return r.
  const tests = [
    {
      // k = n
      K: 3,
      t: [9, 7, 4],
      r: [
        { val: 11, start: 1, end: 2 },
        { val: 16, start: 0, end: 1 },
        { val: 20, start: 0, end: 2 },
      ],
    },
    {
      // k < n
      K: 2,
      t: [9, 7, 4],
      r: [{ val: 16, start: 0, end: 1 }, { val: 20, start: 0, end: 2 }],
    },
    {
      K: 3,
      t: [3, -10, 9, 3, 4, -3, 90],
      r: [
        { val: 94, start: 3, end: 6 },
        { val: 96, start: 0, end: 6 },
        { val: 103, start: 2, end: 6 },
      ],
    },
    {
      // k < n
      K: 2,
      t: [4, 7, 9],
      r: [{ val: 16, start: 1, end: 2 }, { val: 20, start: 0, end: 2 }],
    },
    {
      K: 4,
      t: [1, -23, 3, 4, 39, 9, 8, 8, 7, 4],
      r: [
        { val: 75, start: 4, end: 9 },
        { val: 78, start: 2, end: 8 },
        { val: 79, start: 3, end: 9 },
        { val: 82, start: 2, end: 9 },
      ],
    },
  ];

  tests.forEach(({ K, t, r }) => {
    const res = _.sortBy(kMaxRanges(K, t), 'val');
    // console.log('Input', t);
    // console.log('Result', res.map((r) => ({ ...r, vals: t.slice(r.start, r.end + 1) })));
    expect(res).toEqual(r);
  });
});

function perfTester() {
  const ns = _.times(4, (a) => Math.pow(10, a + 2));
  const repeats = 5;

  const ks = _.times(4, (a) => Math.pow(10, a + 1));

  ns.forEach((n) => {
    ks.forEach((k) => {
      if (k > n) return;

      console.time(`n=${n} k=${k}`);
      const input = _.times(n, () => _.random(-1000, 1000));
      _.times(repeats, () => kMaxRanges(k, input));
      console.timeEnd(`n=${n} k=${k}`);
    });
  });
}

// test('perf', () => {
// perfTester();
// });
