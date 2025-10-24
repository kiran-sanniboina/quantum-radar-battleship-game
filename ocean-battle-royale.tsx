import React, { useState, useEffect, useRef } from 'react';
import { Radar, Waves, Zap, Target, Activity, Loader } from 'lucide-react';

const OceanBattleRoyale = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('loading');
  const [playerShip, setPlayerShip] = useState({ x: 50, y: 50, health: 100, ammo: 20 });
  const [enemyShips, setEnemyShips] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [quantumRadar, setQuantumRadar] = useState({ active: false, cooldown: 0, charges: 3 });
  const [detectedShips, setDetectedShips] = useState([]);
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [quantumData, setQuantumData] = useState(null);
  const [wave, setWave] = useState(1);
  const [gameTime, setGameTime] = useState(0);
  const [qiskitLoaded, setQiskitLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing Quantum System...');
  const [loadingError, setLoadingError] = useState(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const SHIP_SIZE = 20;
  const BULLET_SIZE = 5;
  const DETECTION_RADIUS = 200;

  // Load Qiskit from CDN - MANDATORY
  useEffect(() => {
    const loadQiskit = async () => {
      try {
        setLoadingStatus('Loading Pyodide (Python Runtime)...');
        
        // Load Pyodide
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.async = true;
        
        script.onload = async () => {
          try {
            setLoadingStatus('Initializing Python Environment...');
            const pyodide = await window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
            });
            
            setLoadingStatus('Installing Qiskit...');
            await pyodide.loadPackage('micropip');
            const micropip = pyodide.pyimport('micropip');
            
            setLoadingStatus('Downloading Qiskit Components...');
            await micropip.install('qiskit');
            
            setLoadingStatus('Verifying Quantum Circuit Compiler...');
            // Test Qiskit installation
            await pyodide.runPythonAsync(`
from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
print("Qiskit verification successful")
            `);
            
            window.pyodide = pyodide;
            setLoadingStatus('Quantum System Ready!');
            setQiskitLoaded(true);
            setTimeout(() => setGameState('menu'), 1000);
          } catch (err) {
            console.error('Qiskit installation error:', err);
            setLoadingError(`Failed to initialize Qiskit: ${err.message}`);
          }
        };
        
        script.onerror = () => {
          setLoadingError('Failed to load Pyodide. Please check your internet connection and refresh the page.');
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Script loading error:', err);
        setLoadingError(`Critical error: ${err.message}`);
      }
    };

    loadQiskit();
  }, []);

  // Quantum entanglement using Qiskit - MANDATORY
  const runQuantumRadarWithQiskit = async () => {
    if (!qiskitLoaded || !window.pyodide) {
      throw new Error('Qiskit not loaded! Cannot run quantum radar.');
    }

    try {
      const pythonCode = `
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator
import numpy as np
import json

# Create quantum radar circuit with entangled photon pairs
def create_quantum_radar_circuit(num_pairs=4):
    results = []
    
    for pair_idx in range(num_pairs):
        # Create Bell state (entangled photon pair)
        qr = QuantumRegister(2, 'photon')
        cr = ClassicalRegister(2, 'measurement')
        qc = QuantumCircuit(qr, cr)
        
        # Create Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
        qc.h(0)  # Apply Hadamard to first photon
        qc.cx(0, 1)  # Entangle with CNOT gate
        
        # Simulate target interaction (phase shift on signal photon)
        # This simulates reflection from potential target
        target_present = np.random.random() > 0.3
        if target_present:
            qc.rz(np.pi/4, 0)  # Phase shift from target
        
        # Measure both photons
        qc.measure([0, 1], [0, 1])
        
        # Execute circuit
        simulator = AerSimulator()
        job = simulator.run(qc, shots=100)
        result = job.result()
        counts = result.get_counts()
        
        # Calculate correlation
        corr_00 = counts.get('00', 0)
        corr_11 = counts.get('11', 0)
        corr_01 = counts.get('01', 0)
        corr_10 = counts.get('10', 0)
        
        # Quantum correlation coefficient
        correlation = (corr_00 + corr_11 - corr_01 - corr_10) / 100.0
        
        # Calculate entanglement fidelity (how close to perfect Bell state)
        fidelity = (corr_00 + corr_11) / 100.0
        
        results.append({
            'pair_id': pair_idx,
            'correlation': float(correlation),
            'fidelity': float(fidelity),
            'measurements': {
                '00': corr_00,
                '01': corr_01,
                '10': corr_10,
                '11': corr_11
            },
            'target_detected': target_present and correlation > 0.4
        })
    
    # Calculate overall quantum advantage
    avg_fidelity = np.mean([r['fidelity'] for r in results])
    avg_correlation = np.mean([r['correlation'] for r in results])
    detection_probability = (avg_fidelity + avg_correlation) / 2.0
    
    quantum_advantage = avg_fidelity > 0.7 and avg_correlation > 0.5
    
    return {
        'photon_pairs': results,
        'avg_fidelity': float(avg_fidelity),
        'avg_correlation': float(avg_correlation),
        'detection_probability': float(detection_probability),
        'quantum_advantage': quantum_advantage,
        'num_targets_detected': sum(1 for r in results if r['target_detected'])
    }

result = create_quantum_radar_circuit(4)
json.dumps(result)
`;

      const result = await window.pyodide.runPythonAsync(pythonCode);
      return JSON.parse(result);
    } catch (err) {
      console.error('Qiskit execution error:', err);
      throw new Error(`Quantum circuit execution failed: ${err.message}`);
    }
  };

  // Initialize enemy ships
  const spawnEnemies = (count) => {
    const enemies = [];
    for (let i = 0; i < count; i++) {
      enemies.push({
        id: Date.now() + i,
        x: Math.random() * (CANVAS_WIDTH - 40) + 20,
        y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
        health: 50 + wave * 10,
        speed: 0.5 + wave * 0.1,
        hidden: Math.random() > 0.3,
        detected: false
      });
    }
    setEnemyShips(enemies);
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setPlayerShip({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, health: 100, ammo: 20 });
    setScore(0);
    setWave(1);
    setQuantumRadar({ active: false, cooldown: 0, charges: 3 });
    spawnEnemies(3);
    setGameTime(0);
  };

  // Activate quantum radar with Qiskit
  const activateQuantumRadar = async () => {
    if (quantumRadar.charges > 0 && quantumRadar.cooldown === 0 && !quantumRadar.active) {
      setQuantumRadar(prev => ({ ...prev, active: true, cooldown: 300, charges: prev.charges - 1 }));
      
      try {
        // Run quantum circuit
        const qData = await runQuantumRadarWithQiskit();
        setQuantumData(qData);

        // Detect hidden ships within range using quantum probability
        const detected = enemyShips.map(enemy => {
          const dist = Math.hypot(enemy.x - playerShip.x, enemy.y - playerShip.y);
          if (dist < DETECTION_RADIUS && enemy.hidden) {
            // Use quantum detection probability
            if (Math.random() < Math.abs(qData.detection_probability)) {
              return { ...enemy, detected: true };
            }
          }
          return enemy;
        });
        setEnemyShips(detected);
        setDetectedShips(detected.filter(e => e.detected));

        setTimeout(() => {
          setQuantumRadar(prev => ({ ...prev, active: false }));
          setTimeout(() => setQuantumData(null), 2000);
        }, 3000);
      } catch (err) {
        console.error('Quantum radar error:', err);
        // Return the charge if quantum radar failed
        setQuantumRadar(prev => ({ ...prev, active: false, charges: prev.charges + 1, cooldown: 0 }));
        alert('Quantum radar malfunction! Please try again.');
      }
    }
  };

  // Shoot bullet
  const shoot = () => {
    if (playerShip.ammo > 0) {
      const angle = Math.atan2(mousePos.y - playerShip.y, mousePos.x - playerShip.x);
      setBullets(prev => [...prev, {
        id: Date.now(),
        x: playerShip.x,
        y: playerShip.y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5
      }]);
      setPlayerShip(prev => ({ ...prev, ammo: prev.ammo - 1 }));
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
      if (e.key === ' ') {
        e.preventDefault();
        shoot();
      }
      if (e.key === 'q' || e.key === 'Q') {
        activateQuantumRadar();
      }
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerShip, mousePos, quantumRadar, enemyShips]);

  // Handle mouse movement
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);

      // Move player
      setPlayerShip(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 3;

        if (keys['w'] || keys['ArrowUp']) newY -= speed;
        if (keys['s'] || keys['ArrowDown']) newY += speed;
        if (keys['a'] || keys['ArrowLeft']) newX -= speed;
        if (keys['d'] || keys['ArrowRight']) newX += speed;

        newX = Math.max(SHIP_SIZE, Math.min(CANVAS_WIDTH - SHIP_SIZE, newX));
        newY = Math.max(SHIP_SIZE, Math.min(CANVAS_HEIGHT - SHIP_SIZE, newY));

        return { ...prev, x: newX, y: newY };
      });

      // Update quantum radar cooldown
      if (quantumRadar.cooldown > 0) {
        setQuantumRadar(prev => ({ ...prev, cooldown: prev.cooldown - 1 }));
      }

      // Move enemies toward player
      setEnemyShips(prev => prev.map(enemy => {
        const angle = Math.atan2(playerShip.y - enemy.y, playerShip.x - enemy.x);
        const newX = enemy.x + Math.cos(angle) * enemy.speed;
        const newY = enemy.y + Math.sin(angle) * enemy.speed;

        // Check collision with player
        const dist = Math.hypot(newX - playerShip.x, newY - playerShip.y);
        if (dist < SHIP_SIZE + 15) {
          setPlayerShip(p => ({ ...p, health: p.health - 5 }));
        }

        return { ...enemy, x: newX, y: newY };
      }));

      // Move bullets
      setBullets(prev => prev.map(bullet => ({
        ...bullet,
        x: bullet.x + bullet.vx,
        y: bullet.y + bullet.vy
      })).filter(b => b.x > 0 && b.x < CANVAS_WIDTH && b.y > 0 && b.y < CANVAS_HEIGHT));

      // Check bullet collisions
      setBullets(prev => {
        const remaining = [...prev];
        const toRemove = new Set();

        prev.forEach((bullet, bIdx) => {
          enemyShips.forEach((enemy, eIdx) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (dist < 15) {
              toRemove.add(bIdx);
              setEnemyShips(enemies => {
                const updated = [...enemies];
                updated[eIdx] = { ...updated[eIdx], health: updated[eIdx].health - 25 };
                if (updated[eIdx].health <= 0) {
                  setScore(s => s + 100);
                  setExplosions(exp => [...exp, { x: enemy.x, y: enemy.y, time: 30 }]);
                  return updated.filter((_, i) => i !== eIdx);
                }
                return updated;
              });
            }
          });
        });

        return remaining.filter((_, idx) => !toRemove.has(idx));
      });

      // Update explosions
      setExplosions(prev => prev.map(exp => ({ ...exp, time: exp.time - 1 })).filter(exp => exp.time > 0));

      // Check game over
      if (playerShip.health <= 0) {
        setGameState('gameover');
      }

      // Check wave clear
      if (enemyShips.length === 0) {
        setWave(w => w + 1);
        setTimeout(() => {
          spawnEnemies(3 + wave);
          setPlayerShip(p => ({ ...p, ammo: p.ammo + 10 }));
          if (quantumRadar.charges < 3) {
            setQuantumRadar(q => ({ ...q, charges: q.charges + 1 }));
          }
        }, 1000);
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState, keys, playerShip, enemyShips, bullets, quantumRadar, wave]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a1929';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ocean waves
    ctx.strokeStyle = '#1e3a5f';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      for (let x = 0; x < CANVAS_WIDTH; x += 10) {
        const y = 50 + i * 60 + Math.sin(x * 0.05 + gameTime * 0.05) * 5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw quantum radar effect
    if (quantumRadar.active) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.arc(playerShip.x, playerShip.y, DETECTION_RADIUS - r * 50, 0, Math.PI * 2);
        ctx.globalAlpha = 0.3 - r * 0.1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Draw enemy ships
    enemyShips.forEach(enemy => {
      const visible = !enemy.hidden || enemy.detected || quantumRadar.active;
      
      if (visible) {
        ctx.fillStyle = enemy.detected ? '#ff6b6b' : '#ff4444';
        ctx.globalAlpha = enemy.hidden && !enemy.detected ? 0.5 : 1;
      } else {
        ctx.fillStyle = '#1e3a5f';
        ctx.globalAlpha = 0.2;
      }

      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y - 15);
      ctx.lineTo(enemy.x - 10, enemy.y + 10);
      ctx.lineTo(enemy.x + 10, enemy.y + 10);
      ctx.closePath();
      ctx.fill();

      // Health bar
      if (visible) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - 15, enemy.y - 25, 30, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x - 15, enemy.y - 25, 30 * (enemy.health / (50 + wave * 10)), 4);
      }

      ctx.globalAlpha = 1;
    });

    // Draw player ship
    ctx.fillStyle = '#4444ff';
    ctx.beginPath();
    ctx.moveTo(playerShip.x, playerShip.y - 15);
    ctx.lineTo(playerShip.x - 10, playerShip.y + 10);
    ctx.lineTo(playerShip.x + 10, playerShip.y + 10);
    ctx.closePath();
    ctx.fill();

    // Draw aim line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(playerShip.x, playerShip.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, BULLET_SIZE, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw explosions
    explosions.forEach(exp => {
      const alpha = exp.time / 30;
      ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, 30 - exp.time, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [gameState, playerShip, enemyShips, bullets, explosions, mousePos, quantumRadar, gameTime]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 p-4">
      {gameState === 'loading' && (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-cyan-400 mb-8 flex items-center justify-center gap-3">
            <Waves className="w-12 h-12" />
            Ocean Battle Royale
          </h1>
          
          {!loadingError ? (
            <div className="bg-gray-800 p-8 rounded-lg max-w-md">
              <Loader className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl text-cyan-300 mb-4">Initializing Quantum Systems</h2>
              <p className="text-gray-300 mb-4">{loadingStatus}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div className="bg-cyan-500 h-2 rounded-full animate-pulse" style={{width: qiskitLoaded ? '100%' : '60%'}}></div>
              </div>
              <p className="text-sm text-gray-400">Loading Qiskit quantum computing framework...</p>
              <p className="text-xs text-gray-500 mt-2">This may take 30-60 seconds on first load</p>
            </div>
          ) : (
            <div className="bg-red-900 border-2 border-red-600 p-8 rounded-lg max-w-md">
              <h2 className="text-2xl text-red-300 mb-4">Quantum System Error</h2>
              <p className="text-red-200 mb-4">{loadingError}</p>
              <p className="text-sm text-red-300 mb-4">Qiskit is required to run this game.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Retry Loading
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'menu' && (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-cyan-400 mb-4 flex items-center justify-center gap-3">
            <Waves className="w-12 h-12" />
            Ocean Battle Royale
          </h1>
          <h2 className="text-2xl text-blue-300 mb-4 flex items-center justify-center gap-2">
            <Radar className="w-6 h-6" />
            Qiskit Quantum Radar Edition
          </h2>
          
          <div className="bg-green-900 border-2 border-green-600 p-3 rounded-lg mb-4 max-w-2xl mx-auto">
            <p className="text-green-200 text-sm flex items-center justify-center gap-2">
              <Activity className="w-5 h-5" />
              ✓ Qiskit Quantum System Online
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg mb-6 max-w-2xl text-left">
            <h3 className="text-xl text-cyan-300 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Qiskit Quantum Radar Technology
            </h3>
            <p className="text-gray-300 mb-4">
              This game uses <strong>real Qiskit quantum circuits</strong> to simulate quantum radar! The system creates Bell states (|Φ+⟩ = (|00⟩ + |11⟩)/√2) using Hadamard and CNOT gates, measures quantum correlations between entangled photon pairs, and detects targets based on phase shifts in the quantum state.
            </p>
            <h3 className="text-xl text-yellow-300 mb-3">Controls:</h3>
            <ul className="text-gray-300 space-y-1">
              <li>• WASD / Arrow Keys - Move ship</li>
              <li>• Mouse - Aim</li>
              <li>• Space / Click - Shoot</li>
              <li>• Q - Activate Quantum Radar (3 charges)</li>
            </ul>
            <h3 className="text-xl text-red-300 mb-3 mt-4">Objective:</h3>
            <p className="text-gray-300">
              Survive waves of enemy ships! Some enemies are hidden (stealth mode). Use your Qiskit-powered quantum radar to detect them through quantum entanglement and correlation measurements.
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            Start Mission
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-8 text-white mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-400" />
              <span>Health: {playerShip.health}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Ammo: {playerShip.ammo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-cyan-400" />
              <span>Q-Radar: {quantumRadar.charges}</span>
            </div>
            <div>Score: {score}</div>
            <div>Wave: {wave}</div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            onClick={shoot}
            className="border-4 border-cyan-600 rounded-lg cursor-crosshair"
          />

          {quantumData && (
            <div className="bg-gray-800 p-4 rounded-lg text-white max-w-md">
              <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Qiskit Quantum Circuit Results
              </h3>
              <p className="text-sm">Entangled Photon Pairs: {quantumData.photon_pairs?.length || 0}</p>
              <p className="text-sm">Avg Entanglement Fidelity: {((quantumData.avg_fidelity || 0) * 100).toFixed(1)}%</p>
              <p className="text-sm">Quantum Correlation: {((quantumData.avg_correlation || 0) * 100).toFixed(1)}%</p>
              <p className="text-sm">Detection Probability: {((quantumData.detection_probability || 0) * 100).toFixed(1)}%</p>
              <p className="text-sm text-green-400">Quantum Advantage: {quantumData.quantum_advantage ? 'Active ✓' : 'Inactive'}</p>
              {quantumData.photon_pairs && quantumData.photon_pairs[0] && (
                <div className="mt-2 text-xs text-gray-400">
                  <p>Bell State Measurements (Pair 1):</p>
                  <p>|00⟩: {quantumData.photon_pairs[0].measurements['00']} |01⟩: {quantumData.photon_pairs[0].measurements['01']}</p>
                  <p>|10⟩: {quantumData.photon_pairs[0].measurements['10']} |11⟩: {quantumData.photon_pairs[0].measurements['11']}</p>
                </div>
              )}
            </div>
          )}

          {quantumRadar.cooldown > 0 && (
            <div className="text-cyan-400">Radar Cooldown: {Math.ceil(quantumRadar.cooldown / 60)}s</div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-red-500 mb-4">Mission Failed</h1>
          <p className="text-2xl text-white mb-4">Final Score: {score}</p>
          <p className="text-xl text-gray-300 mb-8">Waves Cleared: {wave - 1}</p>
          <button
            onClick={startGame}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            Retry Mission
          </button>
        </div>
      )}
    </div>
  );
};

export default OceanBattleRoyale;