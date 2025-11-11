import { useEffect, useState } from "react";
import { CharacterService } from "../../data/services/character.service";
import { Character } from "../../domain/models/Character.model";

/**
 * Hook personalizado para manejar la lista de personajes
 *
 * Responsabilidades:
 * - Obtener lista de personajes
 * - Manejar estados de carga
 * - Manejar errores
 * - Implementar paginación
 */
export const useCharacters = (initialPage: number = 1) => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(initialPage);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");


    /**
     * Función para cargar personajes y buscar por nombre personaje 
     */
    const fetchCharacters = async (pageNumber: number, searchName: string = "") => {
        try {
            setLoading(true);
            setError(null);

            const response = await CharacterService.getCharacters(pageNumber, 10, searchName);

            // Si la respuesta es un array 
            if (Array.isArray(response)) {
                setCharacters(response);
                setHasMore(false);
                return;
            }
            // Si la respuesta es paginada
            if (!response || !response.meta || !response.items) {
                setCharacters([]);
                setHasMore(false);
                return;
            }
            if (pageNumber === 1) {
                setCharacters(response.items);
            } else {
                setCharacters((prev) => [...prev, ...response.items]);
            }
            setHasMore(response.meta.currentPage < response.meta.totalPages);
        } catch (err) {
            setError("Error al cargar personajes. Intenta nuevamente.");
            console.error('Error en fetchCharacters:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cargar más personajes (siguiente página)
     */
    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchCharacters(nextPage, search);
        }
    };

    /**
     * Recargar personajes (pull to refresh)
     */
    const refresh = () => {
        setPage(1);
        fetchCharacters(1, search);
    };
    /*
    * Busqueda de personajes por nombre
    */



    // Cargar personajes al montar el componente
    useEffect(() => {
        setPage(1);
        fetchCharacters(1, search);
    }, [search]);

    return {
        characters,
        loading,
        error,
        loadMore,
        refresh,
        hasMore,
        search,
        setSearch,
    };
};
