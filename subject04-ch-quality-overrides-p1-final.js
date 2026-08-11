// Subject 4 final P1 answer-risk QA verification metadata.
(function applySubject04FinalP1QualityOverrides(){
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
})();
