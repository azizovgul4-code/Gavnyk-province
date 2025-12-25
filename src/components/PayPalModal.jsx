import React, {useEffect, useRef, useState} from 'react'

// PayPal modal component: loads SDK if needed, renders Buttons into a ref container
// Accessible: focus trap, ESC to close, backdrop click to close

export default function PayPalModal({amount, onClose, onSuccess}){
  const containerRef = useRef(null)
  const modalRef = useRef(null)
  const closeRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [debugId, setDebugId] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(()=>{
    let mounted = true
    const prevActive = document.activeElement
    const buttonsInstanceRef = { current: null }

    function cleanupButtons(){ try{ if(buttonsInstanceRef.current && buttonsInstanceRef.current.close) buttonsInstanceRef.current.close(); }catch(e){} }

    async function ensureSdk(){
      if(window.paypal) return window.paypal
      const existing = Array.from(document.scripts).find(s=>s.src && s.src.includes('paypal.com/sdk'))
      if(existing){ await new Promise((res,rej)=>{ existing.addEventListener('load',res); existing.addEventListener('error',rej) }) }
      else{ const s = document.createElement('script'); s.src = 'https://www.paypal.com/sdk/js?client-id=ASrX5eoMyqXS_abvLzW885ym0hj4tMURDikDfCE7dwkkv_0X5a4X0brZvfBSiKosBYnKv8PxEm4v4LrS&currency=USD'; s.async=true; document.head.appendChild(s); await new Promise((res,rej)=>{ s.addEventListener('load',res); s.addEventListener('error',rej) }) }
      if(!window.paypal) throw new Error('PayPal SDK unavailable after load.')
      return window.paypal
    }

    async function renderButtons(){
      setLoading(true); setErr(null); setDebugId(null)
      try{
        await ensureSdk(); if(!mounted) return
        if(!containerRef.current) throw new Error('Container not found')

        // create the Buttons instance with robust error capture
        const buttons = window.paypal.Buttons({
          style:{shape:'rect',label:'pay',height:42},
          onInit: function(data){ console.log('PayPal Buttons init', data); },
          onClick: function(){ setErr(null); setDebugId(null); console.log('PayPal button clicked') },
          createOrder: async function(data, actions){
            try{
              const id = await actions.order.create({purchase_units:[{amount:{value:String(amount)}}]})
              return id
            }catch(err){
              console.error('createOrder failed', err);
              const debug = err && (err.debug_id || err.name || err.message) || String(err)
              setErr(String(err)); setDebugId(err && err.debug_id ? err.debug_id : null)
              throw err
            }
          },
          onApprove: function(data, actions){ return actions.order.capture().then(function(details){ if(onSuccess) onSuccess(details); }) },
          onError: function(e){ console.error('PayPal onError', e); const debug = e && (e.debug_id || e.message) || String(e); setErr(String(e)); setDebugId(e && e.debug_id ? e.debug_id : null) }
        })

        // clear container then render
        containerRef.current.innerHTML = ''
        await buttons.render(containerRef.current)
        buttonsInstanceRef.current = buttons
      }catch(e){ console.error('PayPal renderButtons error', e); setErr(String(e)); }
      finally{ if(mounted) setLoading(false) }
    }

    renderButtons()

    // re-render on retry
    if(retryKey){ /* effect will re-run automatically because retryKey in deps */ }

    // focus management and ESC/tab trap
    function onKey(e){ if(e.key==='Escape') onClose(); }
    function trapTab(e){ if(e.key !== 'Tab') return; const focusables = modalRef.current.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'); if(!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length-1]; if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('keydown', trapTab)

    // autofocus close button
    setTimeout(()=>{ try{ closeRef.current && closeRef.current.focus() }catch(e){} },30)

    return ()=>{ mounted=false; cleanupButtons(); if(prevActive && prevActive.focus) prevActive.focus(); document.removeEventListener('keydown', onKey); document.removeEventListener('keydown', trapTab) }
  }, [amount, onClose, onSuccess, retryKey])

  // backdrop click
  function onBackdropClick(e){ if(e.target === modalRef.current) onClose(); }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="paypal-title" ref={modalRef} onClick={onBackdropClick} style={{display:'flex'}}>
      <div className="modal-content" style={{maxWidth:520, width:'92%', position:'relative'}}>
        {/*<button ref={closeRef} id="paypal-close" className="btn small" onClick={onClose} style={{position:'absolute',right:12,top:12}}>Close</button>*/}
        <h3 id="paypal-title">Complete Donation</h3>
        <div style={{marginBottom:12}} id="paypal-info">{`Amount: $${amount}`}</div>
        {loading && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
            <div className="modal-spinner" aria-hidden="true" style={{width:40,height:40,borderRadius:6,background:'linear-gradient(90deg,#ffd24a,#f9b62f)'}}></div>
          </div>
        )}
        {err && (
          <div style={{padding:8}}>
            <div style={{color:'#c00',fontSize:13,marginBottom:6}}>Error: {err}</div>
            {debugId && <div style={{fontSize:12,color:'#444',marginBottom:8}}>Debug ID: <code style={{background:'#f4f4f4',padding:'2px 6px',borderRadius:4}}>{debugId}</code></div>}
            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <button className="btn small" onClick={()=>{ setErr(null); setDebugId(null); setRetryKey(k=>k+1); }}>Retry</button>
              <button className="btn small" onClick={()=>{ window.open('https://developer.paypal.com/api/rest/reference/orders/v2/errors/#INTERNAL_SERVICE_ERROR', '_blank') }}>Help</button>
            </div>
          </div>
        )}
        <div id="paypal-button-container" ref={containerRef} style={{display: loading || err ? 'none' : 'flex', justifyContent:'center'}}></div>
      </div>
    </div>
  )
}
