const commonRates = [60, 120, 144, 240];

function findNearestRateWithGoodDivisor(rate) {
    const validRates = commonRates.filter(r => r <= rate);

    if (validRates.length === 0) return 60;

    return validRates.reduce((prev, curr) =>
        Math.abs(curr - rate) < Math.abs(prev - rate) ? curr : prev
    );
}

function setMode(mode) {
    const fixedBtn = document.getElementById("fixedButton");
    const vrrBtn = document.getElementById("vrrButton");

    if (mode === 'vrr') {
        vrrBtn.classList.add('active');
        fixedBtn.classList.remove('active');
    } else {
        fixedBtn.classList.add('active');
        vrrBtn.classList.remove('active');
    }

    document.getElementById("refreshMode").value = mode;
    document.getElementById("fpsResults").style.display = "none";
}

function getLargestDivisors(number) {
    const divisors = [];
    for (let i = 1; i <= number; i++) {
        if (number % i === 0) {
            divisors.push(i);
        }
    }
    return divisors;
}

function calculateFPS() {
    const refreshRateInput = document.getElementById("refreshRate");
    const rr = parseFloat(refreshRateInput.value);
    const mode = document.getElementById("refreshMode").value;
    const results = document.getElementById("fpsResults");


    const maxLimitAttr = refreshRateInput.getAttribute("max");
    const maxRecommendedFPS = maxLimitAttr && maxLimitAttr !== "none" ? parseFloat(maxLimitAttr) : null;

    if (!rr || rr < 60) {
        results.innerHTML = `
            <div class="card card-red">
                <p>60Hz 이상의 올바른 주사율을 입력하세요.</p>
            </div>
        `;
        results.style.display = "block";
        return;
    }

    if (mode === 'vrr') {
        let rrVRR = Math.round(rr * (1 - rr * 0.00028));

        if (maxRecommendedFPS && rrVRR > maxRecommendedFPS) {
            rrVRR = maxRecommendedFPS;
        }

        results.innerHTML = `
            <div class="card card-basic">
                <p>권장 FPS 제한 범위: 48* ~ ${rrVRR} 중 원하는 값</p>
            </div>
            <div class="card card-yellow">
                <p>
                    *일반적인 VRR 범위는 48 FPS부터 시작하지만 일부 디스플레이는 30 또는 1 FPS부터 지원합니다.<br>
                    <a href="https://www.nvidia.com/en-us/geforce/products/g-sync-monitors/specs/" target="_blank">이 목록</a>이나 제품 페이지에서 모니터의 VRR 범위를 확인하세요.
                </p>
            </div>
            <div class="card card-green">
                <p>
                    시스템이 안정적으로 유지할 수 있는 가장 높은 값을 선택하세요.
                </p>
            </div>
        `;
    } else {
        let usableDivisors = getLargestDivisors(rr).filter(d => d >= 60);

        if (maxRecommendedFPS) {
            usableDivisors = usableDivisors.filter(d => d <= maxRecommendedFPS);
        }

        let recommendations = usableDivisors.map(d =>
            d === rr ? `${(d - 0.05).toFixed(2)}` : d
        ).join(' 또는 ');

        let warning = '';
        if (!commonRates.includes(rr) && rr > 75) {
            const better = findNearestRateWithGoodDivisor(rr);
            warning = `
                <div class="card card-red">
                    <p>
                        현재 주사율(${rr}Hz)은 고정 주사율보다 VRR에 더 적합한 나눗값을 가집니다.<br>
                        디스플레이가 VRR을 지원한다면 활성화를 권장합니다. 지원하지 않고 권장 FPS에 가까운 성능을 유지하기 어렵다면 <b>${better}Hz</b>로 바꾸는 것도 고려하세요. <b>Nvidia Control Panel</b> 또는 <b>Adrenalin</b>에서 변경할 수 있습니다.
                    </p>
                </div>
            `;
        }

        results.innerHTML = `
            <div class="card card-basic">
                <p>권장 FPS 제한값: ${recommendations} ${usableDivisors.length === 1 ? '' : '(하나 선택)'}</p>
            </div>
            ${warning}
            <div class="card card-green">
                <p>
                    시스템이 안정적으로 유지할 수 있는 가장 높은 값을 선택하세요.
                </p>
            </div>
        `;
    }

    results.style.display = "block";
}