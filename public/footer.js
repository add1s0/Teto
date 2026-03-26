class Footer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = 

       ` <style> 
       .footer {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(0.5rem);
    -webkit-backdrop-filter: blur(0.5rem);
    color: var(--primary-color);
    margin-top: 2.5rem;
    border-radius: 0;
    box-shadow: 0 -0.5rem 1rem rgba(0,0,0,0.05);
}

.footer-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 2.5rem;
    padding: 2.5rem 3.75rem;
    max-width: 87.5rem;
    margin: 0 auto;
}

.footer-left {
    text-align: left;
}

.footer-contact {
    text-align: right;
}

.footer h2 {
    margin-bottom: 0.75rem;
    font-size: 2.1rem;
    color: var(--primary-color);
}

.footer .med {
    color: var(--primary-color);
}

.footer .guide {
    color: var(--accent-green);
}

.footer-left p {
    opacity: 0.9;
    max-width: 26.875rem;
    font-size: 1.1rem;
    line-height: 1.7;
}

.footer-contact h4 {
    margin-bottom: 0.75rem;
    font-size: 1.9rem;
    color: var(--primary-color);
}

.footer-contact p {
    margin: 0.5rem 0;
    font-size: 1.05rem;
    color: var(--primary-color);
}

.footer-bottom {
    text-align: center;
    padding: 1rem;
    background: rgba(18, 65, 112, 0.08);
    border-radius: 0;
    font-size: 0.95rem;
    color: var(--primary-color);
}

@media (max-width: 62rem) {

    .footer-container {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 2.1875rem 1.5625rem;
    }

    .footer-left,
    .footer-contact {
        text-align: center;
    }

    .footer-left p {
        margin: 0 auto;
    }
}

@media (max-width: 48rem) {

    .footer h2,
    .footer-contact h4 {
        font-size: 1.7rem;
    }
}
       </style>
       <footer class="footer"> 
    <div class="footer-container">

        <div class="footer-left">
            <h2><span class="med">Med</span><span class="guide">Guide</span></h2>
            <p>Вашият интелигентен помощник за здраве и лекарства.</p>
        </div>
        <div class="footer-contact">
            <h4>Контакт</h4>
            <p>📧 meddguide12@gmail.com</p>
            <p>📍 България</p>
        </div>

    </div>

    <div class="footer-bottom">
        <p>© 2026 MedGuide. Всички права запазени.</p>
    </div>
</footer>`
  }
}
customElements.define('footer-section', Footer);