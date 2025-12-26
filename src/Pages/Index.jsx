import { useEffect, useState } from "react";
import "@fontsource/press-start-2p";
import PayPalModal from '../components/PayPalModal'

function Index() {
  const [paypalAmount, setPaypalAmount] = useState(null);

  function burst(x, y, color = "#ffd54a", count = 18) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.background = color;
      document.body.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 30;
      const life = 800 + Math.random() * 600;
      const start = performance.now();

      function frame(now) {
        const t = (now - start) / life;
        if (t > 1) return p.remove();
        const ease = 1 - Math.pow(1 - t, 3);
        p.style.left = x + vx * ease + "px";
        p.style.top = y + vy * ease + 0.5 * 400 * t * t + "px";
        p.style.opacity = String(1 - t);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }

  function spawnCoin(x, y) {
    const el = document.createElement("div");
    el.className = "coin";
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("pop"));
    setTimeout(() => el.remove(), 1200);
  }

  // PayPal handled by React modal component (see PayPalModal).
  // Old DOM-based modal helpers removed to avoid duplication.

  function handleBtnClick(amount, e){ const el = e.currentTarget; const r = el.getBoundingClientRect(); const x = r.left + r.width/2; const y = r.top + r.height/2; burst(x,y); spawnCoin(x,y); setPaypalAmount(amount); }

  // legacy DOM-based modal removed; using React PayPalModal component for accessibility and responsiveness
  // nothing to do here

  // Setup parallax and block click interactions (non-visual behavior)
  useEffect(()=>{
    const hero = document.querySelector('.hero'); let onMove;
    if(hero){ hero.setAttribute('data-parallax','on'); onMove = (e)=>{ const cx = window.innerWidth/2, cy = window.innerHeight/2; const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy; const tx = dx*8, ty = dy*6; hero.style.transform = `translate3d(${tx}px,${ty}px,0) rotate(${dx*1.5}deg)`; const fb = document.querySelector('.floating-blocks'); if(fb) fb.style.transform = `translate3d(${tx*0.6}px,${ty*0.6}px,0)`; }; window.addEventListener('mousemove', onMove); }
    const blocks = document.querySelectorAll('.floating-blocks .block'); const listeners = [];
    blocks.forEach(b=>{ const onClick = ()=>{ if(Math.random()<0.32){ b.classList.add('break'); setTimeout(()=>b.remove(),520); }else{ b.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-72%) scale(1.06)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:420}); } }; b.addEventListener('click', onClick); listeners.push(()=>b.removeEventListener('click', onClick)); });
    return ()=>{ if(onMove) window.removeEventListener('mousemove', onMove); listeners.forEach(fn=>fn()); };
  }, []);

  

  return (
    <>
      {/* ⚠️ JSX НИЖЕ — НЕ ТРОНУТ */}
      <main className="hero">
        <h1 className="title">Поддержите Сервер</h1>
        <p className="subtitle">Поддерживайте работу мира — помогайте создавать, размещать и расширять!</p>

        <div className="cta-row">
          <a className="btn btn-donate" href="#donate">Купить Сейчас</a>
          <a className="btn btn-tier" href="#tiers">Посмотреть Уровни</a>
        </div>

        <div className="floating-blocks" aria-hidden="true">
          <div className="block dirt" style={{ "--x": "10", "--y": "20", "--d": "0.0" }}></div>
          <div className="block grass" style={{ "--x": "70", "--y": "30", "--d": "0.2" }}></div>
          <div className="block stone" style={{ "--x": "40", "--y": "60", "--d": "0.4" }}></div>
          <div className="block diamond" style={{ "--x": "85", "--y": "10", "--d": "0.6" }}></div>
        </div>
      </main>

      <section id="donate" className="panel">
        <h2>Быстрый Донат</h2>
        <p>Выберите сумму и нажмите на карточку, чтобы сделать пожертвование через PayPal.</p>
        <div className="donation-cards">
          <div className="card">
            <div className="amount">$2</div>
            <div className="desc">Закуска и топливо</div>
            <button className="card-donate btn small" data-amount="2" onClick={(e)=>handleBtnClick(2,e)}>Донатить</button>
          </div>
          <div className="card">
            <div className="amount">$5</div>
            <div className="desc">Обслуживание сервера</div>
            <button className="card-donate btn small" data-amount="5" onClick={(e)=>handleBtnClick(5,e)}>Донатить</button>
          </div>
          <div className="card">
            <div className="amount">$10</div>
            <div className="desc">Плагин и резервное копирование</div>
            <button className="card-donate btn small" data-amount="10" onClick={(e)=>handleBtnClick(10,e)}>Донатить</button>
          </div>
          <div className="card card-custom">
            <div className="amount">Кастомный Донат</div>
            <div className="desc">Введите свою сумму</div>
            <button id="custom-btn" className="btn small" onClick={()=>{ const v = prompt('Введите сумму'); if(v) handleBtnClick(v, {currentTarget: document.getElementById('custom-btn')}); }}>Кастомный</button>
          </div>
        </div>
        <div className="note">Эти карточки открывают диалог PayPal — замените client-id для продакшена.</div>
      </section>

      <section id="tiers" className="panel tiers">
        <h2>Уровни Донатов</h2>
        <p>Поддержите сервер и получите бонусы. Нажмите на уровень, чтобы сделать пожертвование через PayPal.</p>
        <div className="tier-grid">
          <div className="tier-card bronze">
            <div className="tier-price">$5</div>
            <h3>Исследователь</h3>
            <ul className="perks"><li>Косметический тег</li><li>Приоритет в чате</li><li>Базовая поддержка</li></ul>
            <button className="tier-choose btn small" data-amount="5" onClick={(e)=>handleBtnClick(5,e)}>Выбор</button>
          </div>

          <div className="tier-card popular silver">
            <div className="ribbon">Most popular</div>
            <div className="tier-price">$10</div>
            <h3>Строитель</h3>
            <ul className="perks"><li>Все преимущества исследователя</li><li>Варп и стартовый комплект</li><li>Ежемесячная благодарность</li></ul>
            <button className="tier-choose btn small" data-amount="10" onClick={(e)=>handleBtnClick(10,e)}>Выбор</button>
          </div>

          <div className="tier-card gold">
            <div className="tier-price">$25</div>
            <h3>Покровитель</h3>
            <ul className="perks"><li>Все преимущества строителя</li><li>Доступ к приватному миру</li><li>Кастомная косметика</li></ul>
            <button className="tier-choose btn small" data-amount="25" onClick={(e)=>handleBtnClick(25,e)}>Выбор</button>
          </div>
        </div>
      </section>

      {/* React-driven PayPal modal (responsive & accessible) */}
      {paypalAmount && (
        <PayPalModal
          amount={paypalAmount}
          onClose={() => setPaypalAmount(null)}
          onSuccess={(details)=>{
            const name = (details && details.payer && details.payer.name && details.payer.name.given_name) || 'donor';
            const target = document.querySelector('.btn-donate') || document.querySelector('.card-donate');
            if(target){ const r = target.getBoundingClientRect(); burst(r.left + r.width/2, r.top + r.height/2, '#ffd54a', 30); spawnCoin(r.left + r.width/2, r.top + r.height/2 - 40); }
            alert('Thanks, ' + name + '! Donation complete.');
            setPaypalAmount(null);
          }}
        />
      )}

    </>
  );
}

export default Index;
