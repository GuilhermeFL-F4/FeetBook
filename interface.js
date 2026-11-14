export function MenuMobile() {
const menuToggle = document.getElementById('menuToggle');
        const closeMenu = document.getElementById('closeMenu');
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('menuOverlay');

        function toggleMenu() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        menuToggle.addEventListener('click', toggleMenu);
        closeMenu.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);}

export function TelaPesquisa() {
    const desktopTrigger = document.getElementById('desktopSearchTrigger');
    const mobileTrigger = document.getElementById('mobileSearchTrigger');
    const searchScreen = document.getElementById('searchScreen');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');

    if (!searchScreen) return;

    function abrirPesquisa() {
        searchScreen.classList.add('active');
     
        setTimeout(() => searchInput.focus(), 100); 
    }

    function fecharPesquisa() {
        searchScreen.classList.remove('active');
        searchInput.value = ''; 
    }

    if (desktopTrigger) desktopTrigger.addEventListener('click', abrirPesquisa);
    if (mobileTrigger) mobileTrigger.addEventListener('click', abrirPesquisa);

    if (closeSearch) closeSearch.addEventListener('click', fecharPesquisa);
} 

export function Configuracoes() {
    const configButton = document.getElementById('button-config');
    const configScreen = document.getElementById('configOptions');
    const closeConfig = document.getElementById('closeConfig');
    const overlay = document.querySelector('.black-overlay');
    const abas = document.querySelectorAll('.config-tab');
    const paineis = document.querySelectorAll('.config-panel');

    if (!configScreen) return;

    function abrirConfiguracoes() {
        configScreen.classList.add('active');
        overlay.classList.add('active');
    }

    if (configButton) configButton.addEventListener('click', abrirConfiguracoes);
    if (closeConfig) closeConfig.addEventListener('click', () => {
        configScreen.classList.remove('active');
        overlay.classList.remove('active');
    });

    abas.forEach(aba => {
        aba.addEventListener('click', () => {
            abas.forEach(a => a.classList.remove('active'));
            paineis.forEach(p => p.classList.remove('active'));

            aba.classList.add('active');

            const alvoId = aba.getAttribute('data-target');
            document.getElementById(alvoId).classList.add('active');
        });
    });
}

export function AlternarTema() {
    
    const radiosTema = document.querySelectorAll('input[name="tema"]');
    document.body.classList.add('FeetChan');

  
    radiosTema.forEach(radio => {
      
        radio.addEventListener('change', (evento) => {
            
         
            const temaEscolhido = evento.target.value; 

        
            document.body.classList.remove('FeetChan', 'FeetFunny');

          
            document.body.classList.add(temaEscolhido);
            
            console.log("Tema alterado para:", temaEscolhido); 
        });
    });
}

export function ChatComentarios() {
    const postWrappers = document.querySelectorAll('.post-wrapper');
    const overlay = document.querySelector('.black-overlay');

    function fecharTodosChats() {
        document.querySelectorAll('.chat-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.post-wrapper').forEach(w => w.classList.remove('chat-open'));
        document.body.classList.remove('no-scroll');
        if (overlay) overlay.classList.remove('active');
    }

    postWrappers.forEach(wrapper => {
        const btnComment = wrapper.querySelector('.btn-comment');
        const chatPanel = wrapper.querySelector('.chat-panel');
        const closeChat = wrapper.querySelector('.close-chat');
        const chatForm = wrapper.querySelector('.chat-form');
        const chatInput = wrapper.querySelector('.chat-form input');
        const chatMessages = wrapper.querySelector('.chat-messages');

        if (!btnComment || !chatPanel) return;

        // Abrir post + chat fixos
        btnComment.addEventListener('click', () => {
            fecharTodosChats();

            wrapper.classList.add('chat-open');
            chatPanel.classList.add('active');
            document.body.classList.add('no-scroll');
            if (overlay) overlay.classList.add('active');

            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        // Fechar pelo botão X
        if (closeChat) {
            closeChat.addEventListener('click', fecharTodosChats);
        }

        // Enviar mensagem no chat
        if (chatForm) {
            chatForm.addEventListener('submit', (evento) => {
                evento.preventDefault();
                const texto = chatInput.value.trim();
                if (!texto) return;

                const novaMsg = document.createElement('div');
                novaMsg.classList.add('chat-msg');
                novaMsg.innerHTML = `<strong>Você:</strong> ${texto}`;
                chatMessages.appendChild(novaMsg);

                chatInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        }
    });

    // Fechar também ao clicar fora (no fundo escuro) no PC
    if (overlay) {
        overlay.addEventListener('click', fecharTodosChats);
    }
}