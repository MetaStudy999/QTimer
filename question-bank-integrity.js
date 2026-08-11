// QTimer question-bank integrity guard.
// Runs after all question data scripts and before state-sync/dashboard.
(function(){
  const expectedSubjects = [
    {key:'s1', name:'1과목 소프트웨어 설계', prefix:'sujebi-2026-sw-design-', expected:221},
    {key:'s2', name:'2과목 소프트웨어 개발', prefix:'sujebi-2026-sw-dev-', expected:158},
    {key:'s3', name:'3과목 데이터베이스 구축', prefix:'sujebi-2026-db-build-', expected:191},
    {key:'s4', name:'4과목 프로그래밍 언어 활용', prefix:'sujebi-2026-prog-lang-', expected:208},
    {key:'s5', name:'5과목 정보시스템 구축관리', prefix:'sujebi-2026-system-mgmt-', expected:145}
  ];

  const expectedS3Max = {1:33, 2:52, 3:73, 4:30, 5:3};
  const removed = [];
  const globalIds = new Set();
  const s3Logical = new Set();
  const normalized = [];

  for (const q of QUESTIONS) {
    if (!q || !q.id) {
      removed.push({reason:'missing_id', id:q?.id || null});
      continue;
    }

    if (globalIds.has(q.id)) {
      removed.push({reason:'duplicate_id', id:q.id});
      continue;
    }

    if (q.id.startsWith('sujebi-2026-db-build-')) {
      const m = q.id.match(/^sujebi-2026-db-build-ch(\d{2})-(\d{2})$/);
      if (!m) {
        removed.push({reason:'s3_noncanonical_id', id:q.id});
        continue;
      }
      const chapter = Number(m[1]);
      const number = Number(m[2]);
      const max = expectedS3Max[chapter];
      if (!max || number < 1 || number > max) {
        removed.push({reason:'s3_out_of_range', id:q.id, chapter, number});
        continue;
      }
      const logicalKey = `${chapter}-${number}`;
      if (s3Logical.has(logicalKey)) {
        removed.push({reason:'s3_duplicate_logical', id:q.id, logicalKey});
        continue;
      }
      s3Logical.add(logicalKey);
    }

    globalIds.add(q.id);
    normalized.push(q);
  }

  if (normalized.length !== QUESTIONS.length) {
    QUESTIONS.splice(0, QUESTIONS.length, ...normalized);
  }

  const subjectCounts = Object.fromEntries(expectedSubjects.map(s => [s.key, QUESTIONS.filter(q => q.id.startsWith(s.prefix)).length]));
  const s3Missing = [];
  for (const [chapterText,max] of Object.entries(expectedS3Max)) {
    const chapter = Number(chapterText);
    for (let number=1; number<=max; number+=1) {
      const key = `${chapter}-${number}`;
      if (!s3Logical.has(key)) s3Missing.push(`ch${String(chapter).padStart(2,'0')}-${String(number).padStart(2,'0')}`);
    }
  }

  const mismatches = expectedSubjects
    .map(s => ({...s, actual:subjectCounts[s.key]}))
    .filter(s => s.actual !== s.expected);

  window.QTIMER_BANK_AUDIT = {
    total: QUESTIONS.length,
    expectedTotal: expectedSubjects.reduce((sum,s)=>sum+s.expected,0),
    subjectCounts,
    expectedSubjects,
    mismatches,
    removed,
    s3Missing
  };

  if (removed.length) console.warn('[QTimer] question-bank integrity removed entries:', removed);
  if (s3Missing.length) console.error('[QTimer] Subject 3 missing canonical questions:', s3Missing);
  if (mismatches.length) console.warn('[QTimer] question-bank count mismatches:', mismatches);
  else console.info('[QTimer] question-bank counts verified:', window.QTIMER_BANK_AUDIT);
})();
