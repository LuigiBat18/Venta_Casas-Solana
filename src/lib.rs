use anchor_lang::prelude::*;

declare_id!("8v1ccGVLwGMsc4Si9oLH2eGTfrmSJFTBGET7yprRZZhP");

#[program]
pub mod venta_casas {
    use super::*;

    pub fn registrar_casa( // Hace el registro de una casa
        ctx: Context<RegistrarCasa>,
        titulo: String,
        descripcion: String,
        precio: u64,
        direccion: String,
        habitaciones: u8,
        metros_cuadrados: u32,
    ) -> Result<()> {
        require!(titulo.len() <= 60, ErrorCasa::TituloDemasiadoLargo);
        require!(descripcion.len() <= 300, ErrorCasa::DescripcionDemasiadoLarga);
        require!(direccion.len() <= 120, ErrorCasa::DireccionDemasiadoLarga);
        require!(precio > 0, ErrorCasa::PrecioInvalido);
        require!(habitaciones > 0 && habitaciones <= 50, ErrorCasa::HabitacionesInvalidas);
        require!(metros_cuadrados > 0, ErrorCasa::MetrosCuadradosInvalidos);

        let casa = &mut ctx.accounts.casa;
        casa.vendedor = ctx.accounts.vendedor.key();
        casa.titulo = titulo;
        casa.descripcion = descripcion;
        casa.precio = precio;
        casa.direccion = direccion;
        casa.habitaciones = habitaciones;
        casa.metros_cuadrados = metros_cuadrados;
        casa.disponible = true;
        casa.bump = ctx.bumps.casa;

        msg!("Casa registrada: {}", casa.titulo);
        Ok(())
    }

    pub fn actualizar_casa( // Actualiza cualquier campo del registro de la casas
        ctx: Context<ActualizarCasa>,
        titulo: String,
        descripcion: String,
        precio: u64,
        direccion: String,
        habitaciones: u8,
        metros_cuadrados: u32,
    ) -> Result<()> {
        require!(titulo.len() <= 60, ErrorCasa::TituloDemasiadoLargo);
        require!(descripcion.len() <= 300, ErrorCasa::DescripcionDemasiadoLarga);
        require!(direccion.len() <= 120, ErrorCasa::DireccionDemasiadoLarga);
        require!(precio > 0, ErrorCasa::PrecioInvalido);
        require!(habitaciones > 0 && habitaciones <= 50, ErrorCasa::HabitacionesInvalidas);
        require!(metros_cuadrados > 0, ErrorCasa::MetrosCuadradosInvalidos);

        let casa = &mut ctx.accounts.casa;
        casa.titulo = titulo;
        casa.descripcion = descripcion;
        casa.precio = precio;
        casa.direccion = direccion;
        casa.habitaciones = habitaciones;
        casa.metros_cuadrados = metros_cuadrados;

        msg!("Casa actualizada: {}", casa.titulo);
        Ok(())
    }

    pub fn marcar_como_vendida(ctx: Context<MarcarVendida>, titulo: String) -> Result<()> { // Si no ocurre nada raro, se puede vender la casa
        let casa = &mut ctx.accounts.casa;
        require!(casa.disponible, ErrorCasa::CasaYaVendida);
        casa.disponible = false;
        msg!("Casa vendida: {}", titulo);
        Ok(())
    }

    pub fn eliminar_casa(_ctx: Context<EliminarCasa>, titulo: String) -> Result<()> { // Eliminación total del registro
        msg!("Casa eliminada: {}", titulo);
        Ok(())
    }
}

// ─── Contextos ───────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(titulo: String)]
pub struct RegistrarCasa<'info> {
    #[account(mut)]
    pub vendedor: Signer<'info>,

    #[account(
        init,
        payer = vendedor,
        space = 8 + CasaState::INIT_SPACE,
        seeds = [titulo.as_bytes(), vendedor.key().as_ref()],
        bump
    )]
    pub casa: Account<'info, CasaState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(titulo: String)]
pub struct ActualizarCasa<'info> {
    #[account(mut)]
    pub vendedor: Signer<'info>,

    #[account(
        mut,
        seeds = [titulo.as_bytes(), vendedor.key().as_ref()],
        bump = casa.bump,
        has_one = vendedor
    )]
    pub casa: Account<'info, CasaState>,
}

#[derive(Accounts)]
#[instruction(titulo: String)]
pub struct MarcarVendida<'info> {
    #[account(mut)]
    pub vendedor: Signer<'info>,

    #[account(
        mut,
        seeds = [titulo.as_bytes(), vendedor.key().as_ref()],
        bump = casa.bump,
        has_one = vendedor
    )]
    pub casa: Account<'info, CasaState>,
}

#[derive(Accounts)]
#[instruction(titulo: String)]
pub struct EliminarCasa<'info> {
    #[account(mut)]
    pub vendedor: Signer<'info>,

    #[account(
        mut,
        seeds = [titulo.as_bytes(), vendedor.key().as_ref()],
        bump = casa.bump,
        has_one = vendedor,
        close = vendedor
    )]
    pub casa: Account<'info, CasaState>,
}

// ─── Estado ──────────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct CasaState {
    pub vendedor: Pubkey,
    #[max_len(60)]
    pub titulo: String,
    #[max_len(300)]
    pub descripcion: String,
    pub precio: u64,
    #[max_len(120)]
    pub direccion: String,
    pub habitaciones: u8,
    pub metros_cuadrados: u32,
    pub disponible: bool,
    pub bump: u8,
}

// ─── Posibles errores durante el registro de la casa ─────────────────────────────────────────────────────────────────

#[error_code]
pub enum ErrorCasa {
    #[msg("El título no puede tener más de 60 caracteres.")]
    TituloDemasiadoLargo,
    #[msg("La descripción no puede tener más de 300 caracteres.")]
    DescripcionDemasiadoLarga,
    #[msg("La dirección no puede tener más de 120 caracteres.")]
    DireccionDemasiadoLarga,
    #[msg("El precio debe ser mayor a 0.")]
    PrecioInvalido,
    #[msg("El número de habitaciones debe estar entre 1 y 50.")]
    HabitacionesInvalidas,
    #[msg("Los metros cuadrados deben ser mayores a 0.")]
    MetrosCuadradosInvalidos,
    #[msg("Esta casa ya fue marcada como vendida.")]
    CasaYaVendida,
}
