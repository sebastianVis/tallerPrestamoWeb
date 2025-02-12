import './components/formComponent.js'
import './components/history.js'

class FormStructure extends HTMLElement{
    constructor(){
        super();
    }
    connectedCallback(){
        this.innerHTML=`
        <div class="container">
        <form-component></form-component>
        <history-component></history-component>
        </div>
        `;
    }
}

customElements.define('form-structure', FormStructure)