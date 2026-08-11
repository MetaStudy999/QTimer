// Subject 4 answer-risk QA — final P1 execution verification.
(function applySubject04FinalRiskOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  const markVerified = (id, note) => {
    const q = byId.get(id);
    if (!q) return;
    Object.assign(q, {
      independentVerified: true,
      independentVerifiedAt: "2026-08-12",
      verificationNote: note
    });
  };

  markVerified('sujebi-2026-prog-lang-ch02-25', "원본 4-14 하단 정답 ④. FourCal.setdata(4,2) 후 add()는 self.fir+self.sec=4+2=6을 반환하므로 ④");
  markVerified('sujebi-2026-prog-lang-ch02-39', "원본 4-21 하단 정답 ②. ob1.a=0+2+4+6+8=20, ob2.c[i]=2i이므로 ob2.a=0+4+8+12+16=40, 합 60 → ②");
})();
