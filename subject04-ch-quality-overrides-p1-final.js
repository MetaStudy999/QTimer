// Subject 4 final answer-risk QA verification metadata.
(function applySubject04FinalRiskQualityOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  const markVerified = (id, note) => {
    const q = byId.get(id);
    if (!q) return;
    Object.assign(q, {
      independentVerified: true,
      independentVerifiedAt: "2026-08-11",
      verificationNote: note
    });
  };

  markVerified('sujebi-2026-prog-lang-ch02-25', "원본 4-14 하단 정답 ④. Python FourCal에서 setdata(4,2) 후 add()는 self.fir+self.sec=6을 반환하므로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-39', "원본 4-21 하단 정답 ②. ob1.a=0+2+4+6+8=20, ob2.a=0+4+8+12+16=40이므로 합 60으로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch03-20', "원본 4-44 하단 정답 ③. HRN 응답비 A=1.25, B=3, C≈1.33, D=11이므로 높은 순서 D→B→C→A");
  markVerified('sujebi-2026-prog-lang-ch03-41', "원본 4-49 하단 정답 ④. SJF는 실행시간이 가장 짧은 P4=3을 가장 먼저 선택");
})();
