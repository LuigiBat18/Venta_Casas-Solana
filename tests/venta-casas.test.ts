// ====================================================================
// Tests — Venta de Casas (en Solana Playground)
// ====================================================================

const TITULO = "Casa Test Playground";
const vendedor = pg.wallet.publicKey;

const [casaPDA, casaBump] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from(TITULO), vendedor.toBuffer()],
  pg.program.programId
);

// Confirma una tx y luego lee la cuenta
async function confirmarYFetch(tx: string) {
  await pg.connection.confirmTransaction(tx, "confirmed");
  return await pg.program.account.casaState.fetch(casaPDA);
}

describe("venta-casas", () => {

  // Limpia el estado antes de correr los tests
  // Si la casa ya existe la elimina para empezar desde cero
  before(async () => {
    const existe = await pg.connection.getAccountInfo(casaPDA);
    if (existe) {
      const tx = await pg.program.methods
        .eliminarCasa(TITULO)
        .accounts({ vendedor, casa: casaPDA })
        .rpc();
      await pg.connection.confirmTransaction(tx, "confirmed");
      console.log("Estado anterior limpiado.");
    }
  });

  it("registra una casa correctamente", async () => {
    const tx = await pg.program.methods
      .registrarCasa(
        TITULO,
        "Casa de prueba para los tests.",
        new BN(2 * web3.LAMPORTS_PER_SOL),
        "Av. Reforma 100, CDMX",
        3,
        150
      )
      .accounts({
        vendedor,
        casa: casaPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const cuenta = await confirmarYFetch(tx);

    assert.equal(cuenta.titulo, TITULO);
    assert.equal(cuenta.habitaciones, 3);
    assert.equal(cuenta.metrosCuadrados, 150);
    assert.equal(cuenta.disponible, true);
    assert.equal(cuenta.vendedor.toString(), vendedor.toString());
    assert.equal(cuenta.bump, casaBump);

    console.log("Casa registrada y datos verificados.");
  });

  it("actualiza la información de la casa", async () => {
    const nuevoPrecio = new BN(1.8 * web3.LAMPORTS_PER_SOL);

    const tx = await pg.program.methods
      .actualizarCasa(
        TITULO,
        "Descripción actualizada con remodelación 2024.",
        nuevoPrecio,
        "Av. Reforma 100, CDMX",
        3,
        165
      )
      .accounts({ vendedor, casa: casaPDA })
      .rpc();

    const cuenta = await confirmarYFetch(tx);

    assert.equal(cuenta.precio.toString(), nuevoPrecio.toString());
    assert.equal(cuenta.metrosCuadrados, 165);
    assert.equal(cuenta.descripcion, "Descripción actualizada con remodelación 2024.");

    console.log("Casa actualizada correctamente.");
  });

  it("marca la casa como vendida", async () => {
    const tx = await pg.program.methods
      .marcarComoVendida(TITULO)
      .accounts({ vendedor, casa: casaPDA })
      .rpc();

    const cuenta = await confirmarYFetch(tx);
    assert.equal(cuenta.disponible, false);

    console.log("Casa marcada como vendida.");
  });

  it("falla al intentar vender una casa ya vendida", async () => {
    try {
      await pg.program.methods
        .marcarComoVendida(TITULO)
        .accounts({ vendedor, casa: casaPDA })
        .rpc();

      assert.fail("Debería haber lanzado un error");
    } catch (err) {
      assert.ok(
        err.message.includes("CasaYaVendida") || err.message.includes("custom program error"),
        `Error inesperado: ${err.message}`
      );
      console.log("Error CasaYaVendida capturado correctamente.");
    }
  });

  it("elimina el listado y cierra la cuenta", async () => {
    const tx = await pg.program.methods
      .eliminarCasa(TITULO)
      .accounts({ vendedor, casa: casaPDA })
      .rpc();

    await pg.connection.confirmTransaction(tx, "confirmed");

    const cuentaEliminada = await pg.connection.getAccountInfo(casaPDA);
    assert.equal(cuentaEliminada, null);

    console.log("Casa eliminada y cuenta cerrada.");
  });

});
