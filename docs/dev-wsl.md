# QTimer — Windows 11 Pro + WSL2 Ubuntu 24.04 개발환경

## 목적

Vercel 배포와 분리하여 QTimer를 WSL2에서 즉시 실행·검증한다.

- WSL2 Ubuntu 24.04: 개발 및 로컬 테스트
- GitHub `feat/v0.1-mvp`: 기준 소스 저장소
- Vercel: 외부 확인용 Preview
- 브라우저 데이터: 기존 QTimer localStorage 학습기록 유지

## 1. 최초 준비

```bash
cd ~
mkdir -p projects
cd projects
git clone https://github.com/MetaStudy999/QTimer.git
cd QTimer
git fetch origin
git switch feat/v0.1-mvp
git pull origin feat/v0.1-mvp
```

이미 clone되어 있다면:

```bash
cd ~/projects/QTimer
git fetch origin
git switch feat/v0.1-mvp
git pull --ff-only origin feat/v0.1-mvp
```

## 2. 환경 확인

GitHub Contents API로 추가된 셸 파일은 실행 비트가 없을 수 있으므로 `bash`로 실행한다.

```bash
bash scripts/check-wsl.sh
```

정상 기준:

- WSL 감지
- Python 3 확인
- Git 확인
- `index.html`, `app.js` 확인
- branch `feat/v0.1-mvp`

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

서버를 중지할 필요 없이 다음 명령으로 최신 파일을 받는다.

```bash
cd ~/projects/QTimer
git pull --ff-only origin feat/v0.1-mvp
```

브라우저에서 `Ctrl+F5`로 강력 새로고침한다.

문제은행 확장 시 기존 Attempt/취약/검증 기록은 QTimer의 상태 동기화 로직에 따라 보존된다.

## 6. 권장 일상 작업 순서

```bash
cd ~/projects/QTimer
git pull --ff-only origin feat/v0.1-mvp
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

여러 저장소 상위 폴더(`~/projects`)를 한 번에 열지 말고 QTimer 저장소 자체만 여는 것을 권장한다. 이는 Git 저장소 자동 탐색과 파일 감시 부하를 줄인다.

## 8. 문제 발생 시

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
git pull --ff-only origin feat/v0.1-mvp
```

그 후 브라우저 `Ctrl+F5`.

### 서버 로그 확인

```bash
cat .qtimer-server.log
```
