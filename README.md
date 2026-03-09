# 🏠 Venta de Casas con Solana

CRUD básico elaborado con Solana Program y desarrollado con **Rust + Anchor** para gestionar el listado de casas en venta directamente en la blockchain de Solana.

Este proyecto se encuentra desplegado en **devnet** con el Program ID `8v1ccGVLwGMsc4Si9oLH2eGTfrmSJFTBGET7yprRZZhP` para su verificación de funcionalidad.

---

## 📋 ¿Qué hace este programa?

Este programa permite a cualquier usuario con una wallet de Solana realizar:

| Instrucción | Descripción |
|---|---|
| `registrar_casa` | Publica una casa en venta en la blockchain |
| `actualizar_casa` | Modifica los datos de la casa (precio, descripción, etc.) |
| `marcar_como_vendida` | Cambia el estado de la casa a "vendida" |
| `eliminar_casa` | Elimina el listado y recupera la renta de la cuenta |

Cada casa se almacena en una **PDA (Program Derived Address)** derivada del título de la casa y la wallet del vendedor, garantizando que solo el vendedor puede modificar o eliminar su propio listado.

---

## 🗂️ Estructura del Proyecto

```
venta-casas/
├── src/
│   └── lib.rs          # Programa principal en Rust + Anchor
├── client/
│   └── main.ts         # Cliente TypeScript para interactuar con el programa
├── tests/
│   └── venta-casas.ts  # Tests con Anchor y Chai
└── README.md
```
---
## 🛠️ Tecnologias usadas

- **Solana**
- **Anchor**
- **Rust**
- **TypeScript**
- **Devnet**: Network para pruebas de Solana (SOL gratis via Airdrop)

---

## 🏗️ Estructura de Datos (CasaState)

Cada casa almacenada en la blockchain contiene los siguientes campos:

```rust
pub struct CasaState {
    pub vendedor:        Pubkey,   // Wallet del vendedor (32 bytes)
    pub titulo:          String,   // Nombre del inmueble (máx. 60 chars)
    pub descripcion:     String,   // Descripción detallada (máx. 300 chars)
    pub precio:          u64,      // Precio en lamports
    pub direccion:       String,   // Dirección física (máx. 120 chars)
    pub habitaciones:    u8,       // Número de habitaciones
    pub metros_cuadrados: u32,     // Metros cuadrados de construcción
    pub disponible:      bool,     // true = en venta | false = vendida
    pub bump:            u8,       // Bump del PDA
}
```

---

## 🚀 Importar a Solana Playground

### Paso 1: Realiza un Fork del repositorio

Primero, asegúrate de tener el repositorio en tu cuenta de GitHub usando el botón **`Fork`**.

### Paso 2: Copia el enlace de tu repositorio

Copia la URL de tu repositorio desde el navegador:

```
https://github.com/TU_USUARIO/Venta_Casas-Solana
```

### Paso 3: Abre el repositorio en Solana Playground

Combina tu URL con el playground:

```
https://beta.solpg.io/github.com/TU_USUARIO/Venta_Casas-Solana
```

Pega esa URL en tu navegador y presiona **Enter**.

### Paso 4: Conecta con tu wallet

1. Haz clic en **"Not Connected"** (esquina inferior izquierda)
2. En la ventana emergente, haz clic en **"Continue"**
3. Solana Playground creará una wallet de Devnet automáticamente
4. Solicita SOL de prueba con el botón **"Airdrop"**

---

## 🛠️ Compilar y Desplegar

### Desde Solana Playground (recomendado):
1. Haz clic en el ícono de **Build**
2. Espera que compile sin errores
3. Haz clic en **Deploy**
4. ¡Tu programa ya está en Devnet!

### Desde una máquina local:
```bash
# Instalar dependencias
yarn install

# Compilar el programa
anchor build

# Ejecutar los tests
anchor test

# Desplegar en Devnet
anchor deploy --provider.cluster devnet
```

---

## 🧪 Ejecutar los Tests

```bash
anchor test
```

Los tests verifican:
- ✅ Registrar una casa correctamente
- ✅ Actualizar los datos de una casa
- ✅ Marcar una casa como vendida
- ❌ Intentar vender una casa ya vendida (debe fallar)
- ✅ Registrar múltiples casas del mismo vendedor
- ✅ Eliminar una casa y recuperar la renta
- ❌ Título demasiado largo (debe fallar con `TituloDemasiadoLargo`)

---

## 💻 Ejecuta el Cliente

```bash
# Asegúrate de haber desplegado el programa primero
anchor run client

# O directamente con ts-node
ts-node client/main.ts
```

El cliente ejecuta el flujo completo: registrar → actualizar → listar → marcar vendida → eliminar.

---

## 🔐 Seguridad del Programa

El programa garantiza que:

- **Solo el vendedor puede modificar su casa** mediante la restricción `has_one = vendedor`
- **Las PDAs son únicas** por combinación de `[titulo, vendedor]`
- **No se puede vender una casa dos veces** gracias al error `CasaYaVendida`
- **Los datos se validan** antes de almacenarse (longitudes y valores positivos)

---

## 🌐 Recursos

- [Solana Playground](https://beta.solpg.io/)
- [WayLearn Latam](https://waylearn.gitbook.io/solana-developer-certification)
- [Documentación de Solana](https://solana.com/docs)

---
## 👤 Sobre el Proyecto

El proyecto fue desarrollado como un ejercicio para la certificación **Solana Developer** de WayLearnLatam, en donde se está adaptando el ejemplo de la Biblioteca Solana para este caso de uso de venta de bienes raíces.

> ℹ️ **Nota:** Este programa solo implementa el backend (on-chain). No incluye frontend.
> 
> ℹ️ **Transaction verificable:** https://explorer.solana.com/tx/3CG2sdQvohSAfXruQkNKdycJM5S1JARKoSSW5W1PeWRyE4umMidWK5svMeGB1BYSxhpDKouhVX36XX7VSoLqXnr6?cluster=devnet
