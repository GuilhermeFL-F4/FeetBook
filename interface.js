import { supabase } from './supabase.js';

// Estado global da sessão e navegação
let usuarioAtual = null;
let perfilAtual = null;
let grupoAtivoId = null;
let grupoAtualObj = null;
let meusGrupos = [];
let canalRealtimeAtual = null;

// =========================================
// UTILITÁRIOS DE DATA E MODAL
// =========================================
function formatarTempo(dataIso) {
    const segundos = Math.floor((new Date() - new Date(dataIso)) / 1000);
    if (segundos < 60) return 'agora mesmo';
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `há ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas} h`;
    const dias = Math.floor(horas / 24);
    return `há ${dias} d`;
}

function fecharTodosModais() {
    if (canalRealtimeAtual) {
        supabase.removeChannel(canalRealtimeAtual);
        canalRealtimeAtual = null;
    }

    document.querySelectorAll('.chat-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.post-wrapper').forEach(w => w.classList.remove('chat-open'));
    document.body.classList.remove('no-scroll');

    ['configOptions', 'authModal', 'uploadModal', 'createGroupModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    const overlay = document.querySelector('.black-overlay');
    if (overlay) overlay.classList.remove('active');
}

// =========================================
// NAVEGAÇÃO BÁSICA (MENU, PESQUISA, CONFIG, TEMA)
// =========================================
export function MenuMobile() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('menuOverlay');

    function toggleMenu() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
}

export function TelaPesquisa() {
    const desktopTrigger = document.getElementById('desktopSearchTrigger');
    const mobileTrigger = document.getElementById('mobileSearchTrigger');
    const searchScreen = document.getElementById('searchScreen');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchScreen) return;

    function fecharPesquisa() {
        searchScreen.classList.remove('active');
        searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
    }

    function vincularCliquesGrupos() {
        searchResults.querySelectorAll('.search-group-result').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                fecharPesquisa();
                abrirGrupoPorId(id);
            });
        });
    }

    async function abrirPesquisa() {
        searchScreen.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);

        if (searchResults) {
            searchResults.innerHTML = '<p>Carregando grupos...</p>';
            const { data: grupos } = await supabase
                .from('groups')
                .select('*')
                .order('name')
                .limit(20);

            if (grupos?.length) {
                let html = '<h3>Grupos disponíveis</h3><ul class="trending-list">';
                grupos.forEach(g => {
                    html += `<li class="search-group-result" data-id="${g.id}" style="cursor:pointer;">
                        <img src="${g.icon_url}" class="avatar" width="36" height="36">
                        <div>
                            <strong>${g.name}</strong>
                            <small style="display:block; opacity:0.8;">${g.description || ''}</small>
                        </div>
                    </li>`;
                });
                html += '</ul>';
                searchResults.innerHTML = html;
                vincularCliquesGrupos();
            } else {
                searchResults.innerHTML = '<p>Nenhum grupo encontrado.</p>';
            }
        }
    }

    if (desktopTrigger) desktopTrigger.addEventListener('click', abrirPesquisa);
    if (mobileTrigger) mobileTrigger.addEventListener('click', abrirPesquisa);
    if (closeSearch) closeSearch.addEventListener('click', fecharPesquisa);

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', async () => {
            const termo = searchInput.value.trim();
            if (!termo) {
                abrirPesquisa();
                return;
            }

            const [{ data: grupos }, { data: usuarios }] = await Promise.all([
                supabase.from('groups').select('*').ilike('name', `%${termo}%`).limit(10),
                supabase.from('profiles').select('*').ilike('username', `%${termo}%`).limit(5)
            ]);

            let html = '';
            if (grupos?.length) {
                html += '<h3>Grupos</h3><ul class="trending-list">';
                grupos.forEach(g => {
                    html += `<li class="search-group-result" data-id="${g.id}" style="cursor:pointer;">
                        <img src="${g.icon_url}" class="avatar" width="36" height="36">
                        <div>
                            <strong>${g.name}</strong>
                            <small style="display:block; opacity:0.8;">${g.description || ''}</small>
                        </div>
                    </li>`;
                });
                html += '</ul><br>';
            }

            if (usuarios?.length) {
                html += '<h3>Usuários</h3><ul class="trending-list">';
                usuarios.forEach(u => {
                    html += `<li><img src="${u.avatar_url}" class="avatar" width="36" height="36"> @${u.username}</li>`;
                });
                html += '</ul>';
            }

            searchResults.innerHTML = html || '<p>Nenhum resultado encontrado.</p>';
            vincularCliquesGrupos();
        });
    }
}

export function Configuracoes() {
    const configButton = document.getElementById('button-config');
    const configScreen = document.getElementById('configOptions');
    const closeConfig = document.getElementById('closeConfig');
    const overlay = document.querySelector('.black-overlay');
    const abas = document.querySelectorAll('.config-tab');
    const paineis = document.querySelectorAll('.config-panel');

    if (!configScreen) return;

    if (configButton) {
        configButton.addEventListener('click', () => {
            configScreen.classList.add('active');
            if (overlay) overlay.classList.add('active');
        });
    }

    if (closeConfig) closeConfig.addEventListener('click', fecharTodosModais);

    abas.forEach(aba => {
        aba.addEventListener('click', () => {
            abas.forEach(a => a.classList.remove('active'));
            paineis.forEach(p => p.classList.remove('active'));
            aba.classList.add('active');
            document.getElementById(aba.getAttribute('data-target')).classList.add('active');
        });
    });
}

export function AlternarTema() {
    const radiosTema = document.querySelectorAll('input[name="tema"]');
    document.body.classList.add('FeetChan');

    radiosTema.forEach(radio => {
        radio.addEventListener('change', (evento) => {
            document.body.classList.remove('FeetChan', 'FeetFunny');
            document.body.classList.add(evento.target.value);
        });
    });
}

// =========================================
// AUTENTICAÇÃO E PERFIL (SUPABASE AUTH)
// =========================================
async function atualizarEstadoUsuario(session) {
    usuarioAtual = session?.user || null;
    const btnAuthAction = document.getElementById('btnAuthAction');
    const accountDetails = document.getElementById('accountDetails');

    if (usuarioAtual) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', usuarioAtual.id)
            .single();

        perfilAtual = profile;
        if (btnAuthAction) btnAuthAction.textContent = `@${profile?.username || 'Perfil'}`;

        if (accountDetails && profile) {
            accountDetails.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${profile.avatar_url}" alt="Avatar" class="avatar" width="60" height="60">
                    <div>
                        <strong>@${profile.username}</strong>
                        <p style="font-size:0.85em; opacity:0.8;">${usuarioAtual.email}</p>
                    </div>
                </div>
                <label class="upload-dropzone" style="min-height:60px; padding:10px; margin-top:10px;">
                    📷 Alterar foto de perfil
                    <input type="file" id="avatarUploadInput" accept="image/*" style="display:none;">
                </label>
                <button type="button" id="btnLogout" class="auth-submit" style="margin-top:10px;">Sair da Conta</button>
            `;

            document.getElementById('btnLogout')?.addEventListener('click', async () => {
                await supabase.auth.signOut();
                fecharTodosModais();
            });

            document.getElementById('avatarUploadInput')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const filePath = `${usuarioAtual.id}/avatar_${Date.now()}`;
                const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, file);
                if (uploadErr) return alert('Erro ao enviar avatar: ' + uploadErr.message);

                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', usuarioAtual.id);

                atualizarEstadoUsuario(session);
                carregarFeed(grupoAtivoId);
            });
        }
    } else {
        perfilAtual = null;
        if (btnAuthAction) btnAuthAction.textContent = 'Entrar';
        if (accountDetails) accountDetails.innerHTML = '<p>Entre na sua conta para gerenciar seu perfil.</p>';
    }

    // Atualiza a barra lateral apenas com os grupos em que o usuário está inscrito
    await carregarMeusGrupos();
}

export function TelaLogin() {
    const btnLogin = document.getElementById('btnAuthAction');
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const overlay = document.querySelector('.black-overlay');

    const authTabs = document.querySelectorAll('.auth-tab');
    const usernameGroup = document.getElementById('usernameGroup');
    const usernameInput = document.getElementById('authUsername');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authForm = document.getElementById('authForm');
    const authFeedback = document.getElementById('authFeedback');

    if (!authModal) return;

    let modoAtual = 'login';

    function abrirLogin() {
        if (usuarioAtual) {
            document.getElementById('configOptions')?.classList.add('active');
            if (overlay) overlay.classList.add('active');
            document.querySelector('[data-target="panel-conta"]')?.click();
            return;
        }
        authModal.classList.add('active');
        if (overlay) overlay.classList.add('active');
        authFeedback.textContent = '';
    }

    if (btnLogin) btnLogin.addEventListener('click', abrirLogin);
    if (closeAuth) closeAuth.addEventListener('click', fecharTodosModais);

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            authFeedback.textContent = '';

            modoAtual = tab.getAttribute('data-mode');
            if (modoAtual === 'register') {
                usernameGroup.classList.remove('hidden');
                usernameInput.required = true;
                authTitle.textContent = 'Criar nova conta';
                authSubmitBtn.textContent = 'Cadastrar';
            } else {
                usernameGroup.classList.add('hidden');
                usernameInput.required = false;
                authTitle.textContent = 'Bem-vindo de volta';
                authSubmitBtn.textContent = 'Entrar';
            }
        });
    });

    if (authForm) {
        authForm.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            authSubmitBtn.disabled = true;
            authFeedback.textContent = 'Aguarde...';

            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value;
            const username = usernameInput.value.trim();

            let resultado;
            if (modoAtual === 'register') {
                resultado = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username } }
                });
            } else {
                resultado = await supabase.auth.signInWithPassword({ email, password });
            }

            authSubmitBtn.disabled = false;

            if (resultado.error) {
                authFeedback.textContent = resultado.error.message;
                return;
            }

            authForm.reset();
            fecharTodosModais();
        });
    }

    supabase.auth.getSession().then(({ data: { session } }) => atualizarEstadoUsuario(session));
    supabase.auth.onAuthStateChange((_event, session) => {
        atualizarEstadoUsuario(session);
        if (grupoAtivoId) {
            abrirGrupoPorId(grupoAtivoId);
        } else {
            carregarFeed(null);
        }
    });
}

// =========================================
// FEED DE POSTS, LIKES E CHAT REALTIME
// =========================================
function configurarEventosPost(wrapper, post) {
    const overlay = document.querySelector('.black-overlay');
    const btnLike = wrapper.querySelector('.btn-like');
    const likeCountSpan = wrapper.querySelector('.like-count');
    const btnComment = wrapper.querySelector('.btn-comment');
    const chatPanel = wrapper.querySelector('.chat-panel');
    const closeChat = wrapper.querySelector('.close-chat');
    const chatForm = wrapper.querySelector('.chat-form');
    const chatInput = wrapper.querySelector('.chat-form input');
    const chatMessages = wrapper.querySelector('.chat-messages');

    if (btnLike) {
        btnLike.addEventListener('click', async () => {
            if (!usuarioAtual) {
                document.getElementById('btnAuthAction')?.click();
                return;
            }

            const jaCurtiu = btnLike.classList.contains('liked');
            let contagem = parseInt(likeCountSpan.textContent, 10) || 0;

            if (jaCurtiu) {
                btnLike.classList.remove('liked');
                likeCountSpan.textContent = Math.max(contagem - 1, 0);
                await supabase
                    .from('post_likes')
                    .delete()
                    .match({ user_id: usuarioAtual.id, post_id: post.id });
            } else {
                btnLike.classList.add('liked');
                likeCountSpan.textContent = contagem + 1;
                await supabase
                    .from('post_likes')
                    .insert({ user_id: usuarioAtual.id, post_id: post.id });
            }
        });
    }

    if (btnComment && chatPanel) {
        btnComment.addEventListener('click', async () => {
            fecharTodosModais();

            wrapper.classList.add('chat-open');
            chatPanel.classList.add('active');
            document.body.classList.add('no-scroll');
            if (overlay) overlay.classList.add('active');

            chatMessages.innerHTML = '<p style="opacity:0.6;">Carregando comentários...</p>';

            const { data: comentarios } = await supabase
                .from('comments')
                .select('*, profiles(username)')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            chatMessages.innerHTML = '';
            (comentarios || []).forEach(c => {
                const div = document.createElement('div');
                div.classList.add('chat-msg');
                div.innerHTML = `<strong>@${c.profiles?.username || 'Usuário'}:</strong> ${c.content}`;
                chatMessages.appendChild(div);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;

            canalRealtimeAtual = supabase
                .channel(`comments-post-${post.id}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` },
                    async (payload) => {
                        const { data: autor } = await supabase
                            .from('profiles')
                            .select('username')
                            .eq('id', payload.new.user_id)
                            .single();

                        const div = document.createElement('div');
                        div.classList.add('chat-msg');
                        div.innerHTML = `<strong>@${autor?.username || 'Usuário'}:</strong> ${payload.new.content}`;
                        chatMessages.appendChild(div);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                )
                .subscribe();
        });
    }

    if (closeChat) closeChat.addEventListener('click', fecharTodosModais);

    if (chatForm) {
        chatForm.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            if (!usuarioAtual) {
                fecharTodosModais();
                document.getElementById('btnAuthAction')?.click();
                return;
            }

            const texto = chatInput.value.trim();
            if (!texto) return;

            chatInput.value = '';
            const { error } = await supabase.from('comments').insert({
                post_id: post.id,
                user_id: usuarioAtual.id,
                content: texto
            });

            if (error) alert('Erro ao comentar: ' + error.message);
        });
    }
}

export async function carregarFeed(groupId = null) {
    const feedPosts = document.getElementById('feedPosts');
    if (!feedPosts) return;

    feedPosts.innerHTML = '<p style="text-align:center; padding:20px;">Carregando posts...</p>';

    let query;
    if (groupId) {
        query = supabase
            .from('posts')
            .select('*, profiles!user_id(username, avatar_url), groups(name)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });
    } else {
        query = supabase
            .rpc('get_random_posts', { limite: 25 })
            .select('*, profiles!user_id(username, avatar_url), groups(name)');
    }

    const { data: posts, error } = await query;

    if (error) {
        feedPosts.innerHTML = `<p>Erro ao carregar feed: ${error.message}</p>`;
        return;
    }

    // Esconde esse post específico apenas no feed principal
    const postsVisiveis = groupId
        ? posts
        : (posts || []).filter(p => p.id !== '47c3cd9c-f011-4afb-99ee-295fa0712e9d');

    let curtidosPeloUsuario = new Set();
    if (usuarioAtual && postsVisiveis?.length) {
        const { data: likes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', usuarioAtual.id);

        likes?.forEach(l => curtidosPeloUsuario.add(l.post_id));
    }

    feedPosts.innerHTML = '';

    if (!postsVisiveis || postsVisiveis.length === 0) {
        feedPosts.innerHTML = '<p style="text-align:center; padding:20px;">Nenhum post encontrado aqui ainda. Seja o primeiro a postar!</p>';
        return;
    }

    postsVisiveis.forEach(post => {
        const jaCurtiu = curtidosPeloUsuario.has(post.id);
        const wrapper = document.createElement('div');
        wrapper.classList.add('post-wrapper');

        wrapper.innerHTML = `
            <article class="post-card">
                <header class="post-header">
                    <img src="${post.profiles?.avatar_url || 'https://via.placeholder.com/60'}" alt="Avatar" class="avatar" width="45" height="45">
                    <div>
                        <span class="username" style="font-weight:bold; display:block;">@${post.profiles?.username || 'Usuário'}</span>
                        <small style="opacity:0.75;">em ${post.groups?.name || 'Grupo'}</small>
                    </div>
                    <span class="post-time">${formatarTempo(post.created_at)}</span>
                </header>
                <div class="post-content">
                    <img src="${post.image_url}" alt="Conteúdo do post" class="post-image">
                </div>
                <footer class="post-actions">
                    <button class="action-btn btn-like ${jaCurtiu ? 'liked' : ''}">
                        <img src="./img/FeetIcon.jpg" alt="" class="ui-icon">
                        <span class="like-count">${post.likes_count}</span>
                    </button>
                    <button class="action-btn btn-comment">
                        <img src="./img/chat.png" alt="" class="ui-icon">
                        <span>Comentar</span>
                    </button>
                </footer>
            </article>

            <aside class="chat-panel">
                <header class="chat-header">
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <img src="./img/feet.png" alt="" class="ui-icon">
                        <span>Comentários</span>
                    </span>
                    <button class="close-chat">✕</button>
                </header>
                <div class="chat-messages"></div>
                <form class="chat-form">
                    <input type="text" placeholder="Digite no chat..." required autocomplete="off">
                    <button type="submit">➤</button>
                </form>
            </aside>
        `;

        feedPosts.appendChild(wrapper);
        configurarEventosPost(wrapper, post);
    });
}

export function ChatComentarios() {
    const overlay = document.querySelector('.black-overlay');
    if (overlay) {
        overlay.addEventListener('click', fecharTodosModais);
    }
}

// =========================================
// UPLOAD DE NOVO POST (STORAGE + DB)
// =========================================
export function TelaUpload() {
    const btnUpload = document.querySelector('.btn-upload');
    const uploadModal = document.getElementById('uploadModal');
    const closeUpload = document.getElementById('closeUpload');
    const overlay = document.querySelector('.black-overlay');

    const uploadForm = document.getElementById('uploadForm');
    const postImageInput = document.getElementById('postImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const dropzoneText = document.getElementById('dropzoneText');
    const postGroup = document.getElementById('postGroup');
    const uploadFeedback = document.getElementById('uploadFeedback');
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');

    if (!uploadModal) return;

    let previewUrlAtual = null;

    function abrirUpload() {
        if (!usuarioAtual) {
            document.getElementById('btnAuthAction')?.click();
            return;
        }
        uploadModal.classList.add('active');
        if (overlay) overlay.classList.add('active');
        uploadFeedback.textContent = '';
    }

    function limparPreview() {
        uploadForm.reset();
        uploadFeedback.textContent = '';
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
        dropzoneText.classList.remove('hidden');
        if (previewUrlAtual) {
            URL.revokeObjectURL(previewUrlAtual);
            previewUrlAtual = null;
        }
    }

    if (btnUpload) btnUpload.addEventListener('click', abrirUpload);
    if (closeUpload) closeUpload.addEventListener('click', () => {
        limparPreview();
        fecharTodosModais();
    });

    if (postImageInput) {
        postImageInput.addEventListener('change', (evento) => {
            const arquivo = evento.target.files[0];
            if (!arquivo) return;

            if (previewUrlAtual) URL.revokeObjectURL(previewUrlAtual);
            previewUrlAtual = URL.createObjectURL(arquivo);

            imagePreview.src = previewUrlAtual;
            imagePreview.classList.remove('hidden');
            dropzoneText.classList.add('hidden');
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            if (!usuarioAtual) return;

            const arquivo = postImageInput.files[0];
            const groupId = postGroup.value;
            if (!arquivo || !groupId) {
                uploadFeedback.textContent = 'Inscreva-se em um grupo antes de postar.';
                return;
            }

            uploadSubmitBtn.disabled = true;
            uploadFeedback.textContent = 'Enviando imagem...';

            const extensao = arquivo.name.split('.').pop();
            const caminhoArquivo = `${usuarioAtual.id}/${Date.now()}.${extensao}`;

            const { error: uploadError } = await supabase.storage
                .from('posts')
                .upload(caminhoArquivo, arquivo);

            if (uploadError) {
                uploadFeedback.textContent = 'Erro no upload: ' + uploadError.message;
                uploadSubmitBtn.disabled = false;
                return;
            }

            const { data: urlData } = supabase.storage.from('posts').getPublicUrl(caminhoArquivo);

            const { error: insertError } = await supabase.from('posts').insert({
                user_id: usuarioAtual.id,
                group_id: groupId,
                image_url: urlData.publicUrl
            });

            uploadSubmitBtn.disabled = false;

            if (insertError) {
                uploadFeedback.textContent = 'Erro ao salvar post: ' + insertError.message;
                return;
            }

            limparPreview();
            fecharTodosModais();
            carregarFeed(grupoAtivoId);
        });
    }
}

// =========================================
// GRUPOS INSCRITOS (SIDEBAR) E PÁGINA DO GRUPO
// =========================================
async function carregarMeusGrupos() {
    const groupsList = document.getElementById('groupsList');
    const postGroupSelect = document.getElementById('postGroup');

    if (!usuarioAtual) {
        meusGrupos = [];
        if (groupsList) groupsList.innerHTML = '';
        if (postGroupSelect) postGroupSelect.innerHTML = '<option value="">Entre na conta primeiro</option>';
        return;
    }

    const { data: membros } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', usuarioAtual.id);

    meusGrupos = (membros || [])
        .map(m => m.groups)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

    if (groupsList) {
        groupsList.innerHTML = '';
        meusGrupos.forEach(g => {
            const li = document.createElement('li');
            li.classList.add('group-item');
            if (g.id === grupoAtivoId) li.classList.add('active');
            li.setAttribute('data-id', g.id);
            li.innerHTML = `<img src="${g.icon_url}" alt="Ícone" class="avatar" width="40" height="40"> ${g.name}`;
            li.addEventListener('click', () => abrirGrupoPorId(g.id));
            groupsList.appendChild(li);
        });
    }

    if (postGroupSelect) {
        postGroupSelect.innerHTML = '';
        if (meusGrupos.length === 0) {
            postGroupSelect.innerHTML = '<option value="">Entre em um grupo primeiro</option>';
        } else {
            meusGrupos.forEach(g => {
                const option = document.createElement('option');
                option.value = g.id;
                option.textContent = g.name;
                postGroupSelect.appendChild(option);
            });
            if (grupoAtivoId && meusGrupos.some(g => g.id === grupoAtivoId)) {
                postGroupSelect.value = grupoAtivoId;
            }
        }
    }
}

export async function TelaGrupos() {
    const groupHeader = document.getElementById('groupHeader');
    const logoHome = document.getElementById('logoHome');
    const btnJoinGroup = document.getElementById('btnJoinGroup');

    if (btnJoinGroup) {
        btnJoinGroup.addEventListener('click', async () => {
            if (!usuarioAtual) {
                document.getElementById('btnAuthAction')?.click();
                return;
            }
            if (!grupoAtivoId) return;

            const jaEhMembro = btnJoinGroup.classList.contains('joined');
            if (jaEhMembro) {
                await supabase
                    .from('group_members')
                    .delete()
                    .match({ user_id: usuarioAtual.id, group_id: grupoAtivoId });
            } else {
                await supabase
                    .from('group_members')
                    .insert({ user_id: usuarioAtual.id, group_id: grupoAtivoId });
            }

            await carregarMeusGrupos();
            abrirGrupoPorId(grupoAtivoId);
        });
    }

    if (logoHome) {
        logoHome.addEventListener('click', () => {
            grupoAtivoId = null;
            grupoAtualObj = null;
            groupHeader?.classList.add('hidden');
            document.querySelectorAll('#groupsList .group-item').forEach(i => i.classList.remove('active'));
            carregarFeed(null);
        });
    }

    await carregarMeusGrupos();
    carregarFeed(null);
}

// =========================================
// CRIAR E EDITAR GRUPO (STORAGE + DB)
// =========================================
export function TelaCriarGrupo() {
    const btnOpen = document.getElementById('btnOpenCreateGroup');
    const btnEdit = document.getElementById('btnEditGroup');
    const modal = document.getElementById('createGroupModal');
    const modalTitle = document.getElementById('createGroupModalTitle');
    const btnClose = document.getElementById('closeCreateGroup');
    const overlay = document.querySelector('.black-overlay');

    const form = document.getElementById('createGroupForm');
    const nameInput = document.getElementById('groupNameInput');
    const descInput = document.getElementById('groupDescInput');
    const bannerInput = document.getElementById('groupBannerInput');
    const iconInput = document.getElementById('groupIconInput');

    const bannerPreview = document.getElementById('bannerPreview');
    const bannerDropText = document.getElementById('bannerDropText');
    const iconPreview = document.getElementById('iconPreview');
    const iconDropText = document.getElementById('iconDropText');

    const feedback = document.getElementById('createGroupFeedback');
    const submitBtn = document.getElementById('createGroupSubmitBtn');

    if (!modal) return;

    let bannerPreviewUrl = null;
    let iconPreviewUrl = null;
    let grupoEmEdicao = null;

    function limparFormularioGrupo() {
        form.reset();
        feedback.textContent = '';
        grupoEmEdicao = null;

        bannerPreview.classList.add('hidden');
        bannerPreview.src = '';
        bannerDropText.classList.remove('hidden');

        iconPreview.classList.add('hidden');
        iconPreview.src = '';
        iconDropText.classList.remove('hidden');

        if (bannerPreviewUrl) {
            URL.revokeObjectURL(bannerPreviewUrl);
            bannerPreviewUrl = null;
        }
        if (iconPreviewUrl) {
            URL.revokeObjectURL(iconPreviewUrl);
            iconPreviewUrl = null;
        }
    }

    // Abrir no modo CRIAÇÃO
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            if (!usuarioAtual) {
                document.getElementById('btnAuthAction')?.click();
                return;
            }
            limparFormularioGrupo();
            if (modalTitle) modalTitle.textContent = 'Criar Novo Grupo';
            submitBtn.textContent = 'Criar Grupo';
            bannerInput.required = true;
            iconInput.required = true;

            modal.classList.add('active');
            if (overlay) overlay.classList.add('active');
        });
    }

    // Abrir no modo EDIÇÃO
    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            if (!usuarioAtual || !grupoAtualObj) return;
            limparFormularioGrupo();

            grupoEmEdicao = grupoAtualObj;
            if (modalTitle) modalTitle.textContent = 'Editar Grupo';
            submitBtn.textContent = 'Salvar Alterações';

            bannerInput.required = false;
            iconInput.required = false;

            nameInput.value = grupoEmEdicao.name;
            descInput.value = grupoEmEdicao.description || '';

            bannerPreview.src = grupoEmEdicao.banner_url;
            bannerPreview.classList.remove('hidden');
            bannerDropText.classList.add('hidden');

            iconPreview.src = grupoEmEdicao.icon_url;
            iconPreview.classList.remove('hidden');
            iconDropText.classList.add('hidden');

            modal.classList.add('active');
            if (overlay) overlay.classList.add('active');
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            limparFormularioGrupo();
            fecharTodosModais();
        });
    }

    if (bannerInput) {
        bannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
            bannerPreviewUrl = URL.createObjectURL(file);
            bannerPreview.src = bannerPreviewUrl;
            bannerPreview.classList.remove('hidden');
            bannerDropText.classList.add('hidden');
        });
    }

    if (iconInput) {
        iconInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
            iconPreviewUrl = URL.createObjectURL(file);
            iconPreview.src = iconPreviewUrl;
            iconPreview.classList.remove('hidden');
            iconDropText.classList.add('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!usuarioAtual) return;

            const nome = nameInput.value.trim();
            const descricao = descInput.value.trim();
            const bannerFile = bannerInput.files[0];
            const iconFile = iconInput.files[0];

            if (!nome) return;
            if (!grupoEmEdicao && (!bannerFile || !iconFile)) return;

            submitBtn.disabled = true;
            const timestamp = Date.now();

            let bannerUrlFinal = grupoEmEdicao ? grupoEmEdicao.banner_url : '';
            let iconUrlFinal = grupoEmEdicao ? grupoEmEdicao.icon_url : '';

            if (bannerFile) {
                feedback.textContent = 'Enviando novo banner...';
                const bannerExt = bannerFile.name.split('.').pop();
                const bannerPath = `${usuarioAtual.id}/banner_${timestamp}.${bannerExt}`;
                const { error } = await supabase.storage.from('groups').upload(bannerPath, bannerFile);
                if (error) {
                    feedback.textContent = 'Erro no banner: ' + error.message;
                    submitBtn.disabled = false;
                    return;
                }
                bannerUrlFinal = supabase.storage.from('groups').getPublicUrl(bannerPath).data.publicUrl;
            }

            if (iconFile) {
                feedback.textContent = 'Enviando nova foto do grupo...';
                const iconExt = iconFile.name.split('.').pop();
                const iconPath = `${usuarioAtual.id}/icon_${timestamp}.${iconExt}`;
                const { error } = await supabase.storage.from('groups').upload(iconPath, iconFile);
                if (error) {
                    feedback.textContent = 'Erro no ícone: ' + error.message;
                    submitBtn.disabled = false;
                    return;
                }
                iconUrlFinal = supabase.storage.from('groups').getPublicUrl(iconPath).data.publicUrl;
            }

            if (grupoEmEdicao) {
                feedback.textContent = 'Salvando alterações...';
                const idEditado = grupoEmEdicao.id;

                const { error: updateError } = await supabase
                    .from('groups')
                    .update({
                        name: nome,
                        description: descricao,
                        banner_url: bannerUrlFinal,
                        icon_url: iconUrlFinal
                    })
                    .eq('id', idEditado);

                submitBtn.disabled = false;

                if (updateError) {
                    feedback.textContent = updateError.code === '23505'
                        ? 'Já existe um grupo com esse nome.'
                        : 'Erro ao editar grupo: ' + updateError.message;
                    return;
                }

                limparFormularioGrupo();
                fecharTodosModais();
                await carregarMeusGrupos();
                abrirGrupoPorId(idEditado);
            } else {
                feedback.textContent = 'Criando grupo...';

                const { data: novoGrupo, error: groupError } = await supabase
                    .from('groups')
                    .insert({
                        name: nome,
                        description: descricao,
                        banner_url: bannerUrlFinal,
                        icon_url: iconUrlFinal,
                        owner_id: usuarioAtual.id
                    })
                    .select()
                    .single();

                if (groupError) {
                    feedback.textContent = groupError.code === '23505'
                        ? 'Já existe um grupo com esse nome.'
                        : 'Erro ao criar grupo: ' + groupError.message;
                    submitBtn.disabled = false;
                    return;
                }

                await supabase.from('group_members').insert({
                    user_id: usuarioAtual.id,
                    group_id: novoGrupo.id
                });

                submitBtn.disabled = false;
                limparFormularioGrupo();
                fecharTodosModais();

                await carregarMeusGrupos();
                abrirGrupoPorId(novoGrupo.id);
            }
        });
    }
}

async function abrirGrupoPorId(groupId) {
    const { data: grupo, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

    if (error || !grupo) return;

    grupoAtivoId = groupId;
    grupoAtualObj = grupo;

    const groupHeader = document.getElementById('groupHeader');
    const groupBannerImg = document.getElementById('groupBannerImg');
    const groupIconImg = document.getElementById('groupIconImg');
    const groupTitle = document.getElementById('groupTitle');
    const groupDescription = document.getElementById('groupDescription');
    const postGroupSelect = document.getElementById('postGroup');
    const btnJoinGroup = document.getElementById('btnJoinGroup');
    const btnEditGroup = document.getElementById('btnEditGroup');

    groupTitle.textContent = grupo.name;
    groupDescription.textContent = grupo.description || '';
    groupBannerImg.src = grupo.banner_url;
    groupIconImg.src = grupo.icon_url;
    groupHeader.classList.remove('hidden');

    // Mostra o botão Editar somente se o usuário logado for o dono do grupo
    if (btnEditGroup) {
        const ehDono = usuarioAtual && grupo.owner_id === usuarioAtual.id;
        btnEditGroup.classList.toggle('hidden', !ehDono);
    }

    if (postGroupSelect && meusGrupos.some(g => g.id === groupId)) {
        postGroupSelect.value = groupId;
    }

    document.querySelectorAll('#groupsList .group-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-id') === groupId);
    });

    const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

    let ehMembro = false;
    if (usuarioAtual) {
        const { data: membro } = await supabase
            .from('group_members')
            .select('*')
            .match({ user_id: usuarioAtual.id, group_id: groupId })
            .maybeSingle();
        ehMembro = !!membro;
    }

    if (btnJoinGroup) {
        btnJoinGroup.classList.toggle('joined', ehMembro);
        btnJoinGroup.textContent = ehMembro ? `Membro (${count || 0}) ✓` : `Entrar (${count || 0})`;
    }

    document.getElementById('mobileSidebar')?.classList.remove('active');
    document.getElementById('menuOverlay')?.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    carregarFeed(groupId);
}