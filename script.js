// Elements
        const tempInput = document.getElementById('tempInput');
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        const convertBtn = document.getElementById('convertBtn');
        const swapBtn = document.getElementById('swapBtn');
        const resultDiv = document.getElementById('result');
        const mercury = document.getElementById('mercury');
        const bulb = document.getElementById('bulb');
        const tube = document.getElementById('tube');

        // Utility: clamp
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

        // Convert any -> Celsius
        function toCelsius(value, unit) {
            if (unit === 'C') return value;
            if (unit === 'F') return (value - 32) * 5 / 9;
            if (unit === 'K') return value - 273.15;
            return value;
        }

        // Celsius -> target
        function fromCelsius(c, unit) {
            if (unit === 'C') return c;
            if (unit === 'F') return c * 9 / 5 + 32;
            if (unit === 'K') return c + 273.15;
            return c;
        }

        // Determine color by Celsius
        function colorForCelsius(c) {
            if (c <= 0) {
                return { color: '#0fb2ff', glow: '0 8px 30px rgba(15,178,255,0.14)' }; // blue
            } else if (c > 0 && c < 35) {
                return { color: '#3be07a', glow: '0 8px 30px rgba(59,224,122,0.12)' }; // green
            } else {
                return { color: '#ff3b3b', glow: '0 10px 34px rgba(255,59,59,0.16)' }; // red
            }
        }

        // Update thermometer visuals from Celsius value
        function updateThermometer(celsius) {
            // -50 -> 0% ; 100 -> 100%
            const percent = clamp(((celsius + 50) / 150) * 100, 0, 100);
            mercury.style.height = percent + '%';

            const { color, glow } = colorForCelsius(celsius);
            mercury.style.background = color;
            bulb.style.background = `radial-gradient(circle at 28% 28%, rgba(255,255,255,0.35), rgba(255,255,255,0.08) 10%), ${color}`;
            bulb.style.boxShadow = `${glow}, inset 0 6px 14px rgba(255,255,255,0.04)`;
        }

        // convert and show
        function convertTemp() {
            const raw = parseFloat(tempInput.value);
            if (Number.isNaN(raw)) {
                resultDiv.textContent = 'Converted: --';
                updateThermometer(-50); // lower
                return;
            }

            const from = fromUnit.value;
            const to = toUnit.value;

            // Step1 -> convert input to Celsius
            const celsius = toCelsius(raw, from);

            // Step2 -> convert to target
            const converted = fromCelsius(celsius, to);

            // Round friendly
            const rounded = Math.round(converted * 100) / 100;

            // Emoji for feeling
            let emoji = '🌡️';
            if (celsius <= 0) emoji = '❄️';
            else if (celsius < 35) emoji = '✅';
            else emoji = '🔥';

            resultDiv.textContent = `Converted: ${rounded} °${to}  ${emoji}`;

            // update thermometer
            updateThermometer(celsius);

            // tiny visual press feedback on convert button
            convertBtn.animate([
                { transform: 'translateY(0) scale(1)', boxShadow: '0 10px 30px rgba(13,150,200,0.18)' },
                { transform: 'translateY(-6px) scale(1.02)', boxShadow: '0 18px 40px rgba(13,150,200,0.22)' },
                { transform: 'translateY(0) scale(1)', boxShadow: '0 10px 30px rgba(13,150,200,0.18)' }
            ], { duration: 260, easing: 'ease-out' });

            // set select backgrounds to hint their active state (improves perceived selection)
            styleSelectActive(fromUnit);
            styleSelectActive(toUnit);
        }

        // Swap units and values
        function swapUnits() {
            const tempVal = tempInput.value;
            const fu = fromUnit.value;
            const tu = toUnit.value;

            // swap selects
            fromUnit.value = tu;
            toUnit.value = fu;

            // attempt to convert displayed value so user sees swapped value in the same unit
            if (tempVal !== '') {
                // convert current numeric value from previous "from" to new "from" (which was to)
                const raw = parseFloat(tempVal);
                if (!Number.isNaN(raw)) {
                    // value is in fu; convert to Celsius then to new fromUnit (tu)
                    const c = toCelsius(raw, fu);
                    const newVal = fromCelsius(c, tu);
                    // display rounded
                    tempInput.value = Math.round(newVal * 100) / 100;
                }
            }

            // small swap animation
            swapBtn.animate([
                { transform: 'rotate(0deg) scale(1)' },
                { transform: 'rotate(180deg) scale(1.02)' },
                { transform: 'rotate(0deg) scale(1)' }
            ], { duration: 320, easing: 'ease-out' });

            // style selects
            styleSelectActive(fromUnit);
            styleSelectActive(toUnit);
        }

        // Improve the visible select styling — set background tint to show selection
        function styleSelectActive(selectEl) {
            // Use different background tint to make selected element pop
            const map = { 'C': 'linear-gradient(90deg,#0fb2ff10,#2de0ff12)', 'F': 'linear-gradient(90deg,#ffd36c12,#ff9a6c12)', 'K': 'linear-gradient(90deg,#b6ffb012,#6cf07a12)' };
            const v = selectEl.value;
            selectEl.style.background = map[v] || 'linear-gradient(90deg,#ffffff06,#ffffff03)';
            selectEl.style.borderRadius = '12px';
        }

        // initial styling
        [fromUnit, toUnit].forEach(el => {
            styleSelectActive(el);
            el.addEventListener('change', () => styleSelectActive(el));
        });

        // hook events
        convertBtn.addEventListener('click', convertTemp);
        swapBtn.addEventListener('click', swapUnits);

        // allow Enter key to convert
        tempInput.addEventListener('keydown', e => { if (e.key === 'Enter') convertTemp(); });

        // start with a friendly default
        tempInput.value = '37';
        fromUnit.value = 'C';
        toUnit.value = 'F';
        styleSelectActive(fromUnit);
        styleSelectActive(toUnit);
        convertTemp();