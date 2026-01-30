# Bot Lu - Espaço TS 🤖

## ⚡ Inicialização Rápida (RECOMENDADO)

### 1️⃣ Configure para Iniciar com o Windows

**Passo 1:** Procure na pasta do bot pelo arquivo **`configurar_inicio_automatico.bat`**

**Passo 2:** Clique com botão direito nele e selecione **"Executar como Administrador"**

**Passo 3:** Deixe o script executar. Você verá:
```
✓ SUCESSO! Bot configurado para iniciar automaticamente!
```

**Pronto!** Na próxima vez que ligar o computador, o bot iniciará automaticamente!

---

## 📱 Como Acessar o Controlador

Depois que o bot iniciar (manualmente ou automaticamente):

1. Abra seu navegador
2. Acesse: **http://localhost:3000/controller.html**
3. Clique em **LIGAR** para ativar o bot WhatsApp
4. Clique em **DESLIGAR** para desativar

---

## 🔧 Se Precisar Iniciar Manualmente

Se quiser iniciar o bot sem reiniciar o PC:
- Clique duas vezes em **`iniciar.bat`**

---

## ⛔ Como Parar o Bot

**Opção 1 - Controlador Web (Recomendado):**
- Acesse http://localhost:3000/controller.html
- Clique em **DESLIGAR**

**Opção 2 - Gerenciador de Tarefas:**
- Pressione `Ctrl + Shift + Esc`
- Procure por `node.exe`
- Clique com direito e selecione "Encerrar Tarefa"

---

## ⚠️ Solução de Problemas

### Erro: "Execute como Administrador"
- Clique com botão direito em `configurar_inicio_automatico.bat`
- Selecione "Executar como Administrador"

### Porta 3000 já em uso
Abra PowerShell e execute:
```powershell
netstat -ano | findstr :3000
taskkill /PID <numero_que_apareceu> /F
```

### Bot não inicia automaticamente
1. Verifique se o script de configuração foi executado
2. Abra: `C:\Users\milly\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
3. Verifique se existe um atalho chamado `Bot-Lu.lnk`

---

## 📁 Arquivos Principais

- **`iniciar.bat`** - Inicia o bot manualmente
- **`configurar_inicio_automatico.bat`** - Configura inicialização automática
- **`controller.html`** - Interface de controle do bot
- **`index.js`** - Bot e servidor principal

---

## 💡 Dicas

✅ **Deixe o bot rodando o dia todo** - Ele funcionará automaticamente

✅ **Acesse pelo navegador** - Pode usar de qualquer dispositivo na rede local

✅ **Verifique o Status** - A página mostra se o bot está Online ou Offline

---

**Precisa de ajuda?** Verifique os logs ou reinicie o computador!

