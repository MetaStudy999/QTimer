# QTimer — Windows 11 Pro + WSL2 Ubuntu 24.04 개발환경

## 목적

배포 플랫폼과 분리하여 QTimer를 WSL2에서 즉시 실행·검증한다.

- WSL2 Ubuntu 24.04: 개발 및 로컬 테스트
- GitHub `work/data-ingest`: 현재 문제 데이터 등록·검증 기준 브랜치
- GitHub `feat/v0.1-mvp`: 기능 통합·안정화 브랜치
- 최종 배포: 문제은행/기능 안정화 후 GitHub Pages, Vercel 또는 다른 정적 호스팅 중 결정
- 브라우저 데이터: QTimer localStorage 학습기록 유지

## 1. 최초 준비

```bash
cd ~
mkdir -p projects
cd projects
git clone https://github.com/MetaStudy999/QTimer.git
cd QTimer
git fetch origin
git switch work/data-ingest
git pull --ff-only origin work/data-ingest
```

이미 clone되어 있다면:

```bash
cd ~/projects/QTimer
git fetch origin
git switch work/data-ingest
git pull --ff-only origin work/data-ingest
```

## 2. 환경 및 문제은행 확인

GitHub Contents API로 추가된 셸 파일은 실행 비트가 없을 수 있으므로 `bash`로 실행한다.

```bash
bash scripts/check-wsl.sh
```

Node.js가 설치되어 있으면 `check-wsl.sh`가 자동으로 다음 감사도 실행한다.

```bash
node scripts/audit-question-bank.mjs
```

현재 정상 기준:

- WSL 감지
- Python 3 확인
- Git 확인
- `index.html`, `app.js` 확인
- branch `work/data-ingest`
- 문제은행 감사 PASS
- 1과목 221
- 2과목 158
- 3과목 191
- 4과목 211
- 5과목 192
- 전체 973

Node.js가 없다면 QTimer 실행 자체에는 문제가 없으며 문제은행 감사만 생략된다.

## 3. QTimer 시작

```bash
bash scripts/start-wsl.sh
```

기본 주소:

```text
http://localhost:8080
```

WSL에서 `powershell.exe` 호출이 가능하면 Windows 기본 브라우저가 자동으로 열린다.

포트를 바꾸려면:

```bash
QTIMER_PORT=8090 bash scripts/start-wsl.sh
```

## 4. QTimer 종료

```bash
bash scripts/stop-wsl.sh
```

## 5. 최신 GitHub 변경 적용

서버를 중지할 필요 없이 최신 파일을 받는다.

```bash
cd ~/projects/QTimer
git fetch origin
git switch work/data-ingest
git pull --ff-only origin work/data-ingest
```

브라우저에서 `Ctrl+F5`로 강력 새로고침한다.

문제은행 확장 시 기존 Attempt/취약/검증 기록은 상태 동기화 로직에 따라 보존한다. localStorage를 임의로 삭제하지 않는다.

## 6. 권장 일상 작업 순서

```bash
cd ~/projects/QTimer
git fetch origin
git switch work/data-ingest
git pull --ff-only origin work/data-ingest
bash scripts/check-wsl.sh
bash scripts/start-wsl.sh
```

브라우저:

```text
http://localhost:8080
```

작업 종료:

```bash
bash scripts/stop-wsl.sh
```

## 7. VS Code 사용 시

Windows에 설치된 VS Code를 사용하고 WSL 폴더만 연다.

```bash
cd ~/projects/QTimer
code .
```

`code .`가 동작하지 않으면 Windows VS Code에서 `Remote - WSL` 연결 후 `/home/<사용자>/projects/QTimer`를 연다.

여러 저장소 상위 폴더(`~/projects`)를 한 번에 열지 말고 QTimer 저장소 자체만 연다. Git 저장소 자동 탐색과 파일 감시 부하를 줄일 수 있다.

## 8. 문제 발생 시

### 문제 수가 예상과 다름

```bash
node scripts/audit-question-bank.mjs
```

감사 결과에서 과목별 실제 수, 중복 ID, JavaScript 로드 오류, 잘못된 정답 범위를 먼저 확인한다.

### 8080 포트가 이미 사용 중

```bash
QTIMER_PORT=8090 bash scripts/start-wsl.sh
```

### PID 파일만 남음

```bash
bash scripts/stop-wsl.sh
bash scripts/start-wsl.sh
```

### 최신 데이터가 화면에 안 보임

```bash
cd ~/projects/QTimer
git fetch origin
git switch work/data-ingest
git pull --ff-only origin work/data-ingest
```

그 후 브라우저 `Ctrl+F5`.

### 서버 로그 확인

```bash
cat .qtimer-server.log
```
