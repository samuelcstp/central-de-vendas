class Notificador {
    static log(mensagem) {
        console.log(`[NOTIFICADOR] ${new Date().toISOString()}: ${mensagem}`);
    }
}

module.exports = Notificador;

