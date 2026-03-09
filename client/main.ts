// ====================================================================
// Cliente — Venta de Casas (Solana Playground) Ejemplo de casa
// ====================================================================

const TITULO = "Casa en Roma Norte";
const vendedor = pg.wallet.publicKey;

const [casaPDA] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from(TITULO), vendedor.toBuffer()],
  pg.program.programId
);

console.log("Programa ID:", pg.program.programId.toString());
console.log("Vendedor:   ", vendedor.toString());
console.log("PDA casa:   ", casaPDA.toString());

// Confirma tx y lee la cuenta
async function confirmarYFetch(tx: string) {
  await pg.connection.confirmTransaction(tx, "confirmed");
  return await pg.program.account.casaState.fetch(casaPDA);
}

// ─── Limpiar si ya existe ─────────────────────────────────────────────
const existente = await pg.connection.getAccountInfo(casaPDA);
if (existente) {
  console.log("\n La casa ya existe, limpiando estado anterior...");
  const txLimpiar = await pg.program.methods
    .eliminarCasa(TITULO)
    .accounts({ vendedor, casa: casaPDA })
    .rpc();
  await pg.connection.confirmTransaction(txLimpiar, "confirmed");
  console.log("Estado limpiado.");
}

// ─── 1. REGISTRAR ────────────────────────────────────────────────────
console.log("\n── 1. Registrando casa...");

const txRegistrar = await pg.program.methods
  .registrarCasa(
    TITULO,
    "Casa de 3 niveles con jardín y cocina equipada.",
    new BN(5 * web3.LAMPORTS_PER_SOL),
    "Calle Orizaba 42, Col. Roma Norte, CDMX",
    3,
    180
  )
  .accounts({
    vendedor,
    casa: casaPDA,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

let cuenta = await confirmarYFetch(txRegistrar);
console.log("Casa registrada! Tx:", txRegistrar);
console.log("   Título:    ", cuenta.titulo);
console.log("   Precio:    ", cuenta.precio.toNumber() / web3.LAMPORTS_PER_SOL, "SOL");
console.log("   Disponible:", cuenta.disponible);

// ─── 2. ACTUALIZAR ───────────────────────────────────────────────────
console.log("\n── 2. Actualizando casa...");

const txActualizar = await pg.program.methods
  .actualizarCasa(
    TITULO,
    "Remodelada en 2024, jardín amplio y cuarto de servicio.",
    new BN(4.5 * web3.LAMPORTS_PER_SOL),
    "Calle Orizaba 42, Col. Roma Norte, CDMX",
    3,
    180
  )
  .accounts({ vendedor, casa: casaPDA })
  .rpc();

cuenta = await confirmarYFetch(txActualizar);
console.log("Casa actualizada! Tx:", txActualizar);
console.log("   Precio nuevo:", cuenta.precio.toNumber() / web3.LAMPORTS_PER_SOL, "SOL");

// ─── 3. MARCAR COMO VENDIDA ──────────────────────────────────────────
console.log("\n── 3. Marcando como vendida...");

const txVendida = await pg.program.methods
  .marcarComoVendida(TITULO)
  .accounts({ vendedor, casa: casaPDA })
  .rpc();

cuenta = await confirmarYFetch(txVendida);
console.log("Casa vendida! Tx:", txVendida);
console.log("   Disponible:", cuenta.disponible);

// ─── 4. ELIMINAR ─────────────────────────────────────────────────────
console.log("\n── 4. Eliminando listado...");

const txEliminar = await pg.program.methods
  .eliminarCasa(TITULO)
  .accounts({ vendedor, casa: casaPDA })
  .rpc();

await pg.connection.confirmTransaction(txEliminar, "confirmed");
console.log("Casa eliminada! Tx:", txEliminar);
console.log("\n🎉 Flujo completo ejecutado!");
