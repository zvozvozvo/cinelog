import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import AddMovieModal from "../components/AddMovieModal";

import Auth from "../pages/Auth";
import Home from "../pages/Home";
import Films from "../pages/Films";
import Watchlist from "../pages/Watchlist";
import Timeline from "../pages/Timeline";
import Statistics from "../pages/Statistics";
import Movie from "../pages/Movie";
import Together from "../pages/Together";
import Recommendations from "../pages/Recommendations";
import Profile from "../pages/Profile";

import { supabase } from "../supabase";
import { getUserMovies } from "./supabaseMovies";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [showAddMovie, setShowAddMovie] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);

      if (session) {
        try {
          const userMovies = await getUserMovies();

          if (mounted) {
            setMovies(userMovies);
          }
        } catch (error) {
          console.error("Failed to load movies:", error);
        }
      }

      if (mounted) setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession);

        if (nextSession) {
          try {
            const userMovies = await getUserMovies();

            if (mounted) {
              setMovies(userMovies);
            }
          } catch (error) {
            console.error("Failed to load movies:", error);
          }
        } else {
          setMovies([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function openAddMovie() {
    setShowAddMovie(true);
  }

  function closeAddMovie() {
    setShowAddMovie(false);
  }

  function addMovie(movie) {
    setMovies((current) => {
      const exists = current.some(
        (item) => String(item.id) === String(movie.id)
      );

      if (exists) {
        return current.map((item) =>
          String(item.id) === String(movie.id) ? movie : item
        );
      }

      return [movie, ...current];
    });

    closeAddMovie();
  }

  function updateMovie(id, changes) {
    setMovies((current) =>
      current.map((movie) =>
        String(movie.id) === String(id)
          ? { ...movie, ...changes }
          : movie
      )
    );
  }

  function deleteMovie(id) {
    setMovies((current) =>
      current.filter((movie) => String(movie.id) !== String(id))
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--paper)] flex items-center justify-center">
        <span className="cine-mono text-[10px] uppercase tracking-[.18em] text-white/40">
          Загрузка...
        </span>
      </main>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--paper)]">
      <div className="cine-shell page-index">
        <Navbar onAddMovie={openAddMovie} />

        <div className="min-h-[calc(100vh-92px)]">
          <Routes>
            <Route
              path="/"
              element={<Home movies={movies} onAddMovie={openAddMovie} />}
            />
            <Route
              path="/films"
              element={<Films movies={movies} onAddMovie={openAddMovie} />}
            />
            <Route
              path="/watchlist"
              element={<Watchlist movies={movies} onAddMovie={openAddMovie} />}
            />
            <Route path="/timeline" element={<Timeline movies={movies} />} />
            <Route path="/statistics" element={<Statistics movies={movies} />} />
            <Route
              path="/together"
              element={<Together movies={movies} />}
            />
            <Route
              path="/recommendations"
              element={<Recommendations movies={movies} onAddMovie={addMovie} />}
            />
            <Route
              path="/profile"
              element={<Profile movies={movies} />}
            />
            <Route
              path="/movie/:id"
              element={
                <Movie
                  movies={movies}
                  onUpdateMovie={updateMovie}
                  onDeleteMovie={deleteMovie}
                />
              }
            />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <footer className="cine-footer">
          <span>CineLog / Личный киноархив</span>
          <span>2026 · На базе TMDB</span>
        </footer>
      </div>

      {showAddMovie && (
        <AddMovieModal onClose={closeAddMovie} onAdd={addMovie} />
      )}
    </main>
  );
}
