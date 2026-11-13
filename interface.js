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
    // 1. Pega todos os inputs de rádio que têm o nome "tema"
    const radiosTema = document.querySelectorAll('input[name="tema"]');

    // 2. Para cada botão de rádio...
    radiosTema.forEach(radio => {
        // 3. Fica de olho no evento 'change' (quando a seleção muda)
        radio.addEventListener('change', (evento) => {
            
            // Pega o valor (value) do botão que acabou de ser clicado
            const temaEscolhido = evento.target.value; 

            // Remove todos os temas antigos do body para não dar conflito
            document.body.classList.remove('FeetChan', 'FeetFunny');

            // Adiciona a classe do novo tema no body
            document.body.classList.add(temaEscolhido);
            
            console.log("Tema alterado para:", temaEscolhido); // Só para você ver funcionando no console!
        });
    });
}