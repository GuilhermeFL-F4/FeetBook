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

    if (!searchScreen) return; // Evita erro se o HTML não carregar

    function abrirPesquisa() {
        searchScreen.classList.add('active');
        // Dá o foco no input automaticamente para o usuário já sair digitando
        setTimeout(() => searchInput.focus(), 100); 
    }

    function fecharPesquisa() {
        searchScreen.classList.remove('active');
        searchInput.value = ''; // Limpa o campo ao fechar (opcional)
    }

    // Eventos de clique para abrir
    if (desktopTrigger) desktopTrigger.addEventListener('click', abrirPesquisa);
    if (mobileTrigger) mobileTrigger.addEventListener('click', abrirPesquisa);
    
    // Evento de clique para fechar
    if (closeSearch) closeSearch.addEventListener('click', fecharPesquisa);
}