# 🛡️ Documentação Técnica - Ecossistema SuperVarejo

Esta documentação detalha a infraestrutura de containers, rede e banco de dados do projeto, servindo como guia de recuperação em caso de falhas ou renovação de certificados.

---

## 🚀 1. Estrutura de Rede e Funcionamento
O sistema opera em uma arquitetura híbrida de containers Docker e serviços locais:

* **Frontend (web):** Container em modo `bridge` servindo os arquivos estáticos.
* **API Principal (api):** Container em modo `bridge` conectado ao banco de dados interno do Docker (`db`).
* **API ERP (api-erp):** Container em modo **`host`**. Ele compartilha o IP do servidor Linux para acessar o banco de dados PostgreSQL local via `127.0.0.1`.
* **Nginx Proxy Manager (NPM):** Gerencia o SSL e distribui o tráfego para os containers acima.

---

## 🔐 2. Gestão de Certificados SSL (Let's Encrypt)
Os certificados são renovados automaticamente pelo NPM 30 dias antes do vencimento.

### Caso o certificado expire ou falhe:
1.  Acesse o painel administrativo: `http://192.168.0.198:81`.
2.  Vá na aba **SSL Certificates**.
3.  Clique nos três pontos ao lado do domínio e selecione **Renew Now**.
4.  **Requisito Crítico:** A porta **80** do seu roteador deve estar aberta e apontando para o servidor Linux para que a validação do Let's Encrypt funcione.

---

## 🛠️ 3. Troubleshooting (Resolução de Problemas)

### ❌ Erro "Internal Error" no Painel NPM
Ocorre quando o Nginx tenta carregar uma configuração com erro de sintaxe (geralmente nomes de host com barras ou containers que não estão na mesma rede).

**Como destravar:**
1.  Acesse o terminal (PuTTY) e entre no container:
    `docker exec -it supervarejo_teste-proxy sh`.
2.  Navegue até a pasta de configurações:
    `cd /data/nginx/proxy_host`.
3.  Remova o arquivo que está causando o erro (ex: `1.conf` conforme indicado nos logs):
    `rm 1.conf`.
4.  Saia e reinicie o proxy:
    `exit` e `docker restart supervarejo_teste-proxy`.

### ❌ Erro "502 Bad Gateway" (API ou ERP)
O Nginx não consegue encontrar o serviço de destino.
* **Verifique os Hostnames:** No painel NPM > Custom Locations, os campos **Forward Hostname** NUNCA devem ter barras (`/`).
    * Para `/api`: Use o nome `api`.
    * Para `/erp`: Use o IP `192.168.0.198` (pois está em modo host).

### ❌ Erro "500 Internal Server Error" na busca de Produtos
Falha de comunicação entre a API ERP e o banco PostgreSQL local.
* **Verificação de IP:** Se o container da API ERP mudar de IP, o PostgreSQL pode bloquear a conexão.
* **Correção:** Verifique o arquivo `/etc/postgresql/14/main/pg_hba.conf` e garanta que a linha abaixo esteja presente:
    `host all all 172.20.0.0/16 scram-sha-256`.
* **Reinicie o Banco:** `sudo systemctl restart postgresql`.

---

## 💻 4. Comandos de Emergência

| Ação | Comando |
| :--- | :--- |
| **Ver logs de todos os serviços** | `docker compose logs -f --tail 50` |
| **Verificar se o Banco Local está ativo** | `sudo systemctl status postgresql` |
| **Ver IP real de um container** | `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' supervarejo_teste-erp-ssl` |
| **Recriar ambiente do zero** | `docker compose up -d --build` |

---

## 📝 5. Notas Importantes de Configuração
* **Portas:** A porta `3333` (API) e `3334` (ERP) devem ser mantidas como estão no arquivo `index.js` do Frontend para evitar erros de referência.
* **Docker Host Mode:** Não adicione a `api-erp` de volta à `networks: supervarejo-net` no arquivo compose, ou ela perderá o acesso ao `127.0.0.1` do banco de dados.