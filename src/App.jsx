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
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(currentSession);

        if (currentSession) {
          try {
            const userMovies = await getUserMovies();
            if (mounted) setMovies(userMovies);
          } catch (error) {
            console.error("Не удалось загрузить киноархив:", error);
          }
        }
      } catch (error) {
        console.error("Не удалось проверить сессию:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setMovies([]);
        return;
      }
      queueMicrotask(async () => {
        try {
          const userMovies = await getUserMovies();
          if (mounted) setMovies(userMovies);
        } catch (error) {
          console.error("Не удалось обновить киноархив:", error);
        }
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function addMovie(movie) {
    setMovies((current) => {
      const exists = current.some((item) => String(item.id) === String(movie.id));
      if (exists) return current.map((item) => String(item.id) === String(movie.id) ? movie : item);
      return [movie, ...current];
    });
    setShowAddMovie(false);
  }

  function updateMovie(id, changes) {
    setMovies((current) => current.map((movie) => String(movie.id) === String(id) ? { ...movie, ...changes } : movie));
  }

  function deleteMovie(id) {
    setMovies((current) => current.filter((movie) => String(movie.id) !== String(id)));
  }

  const openAddMovie = () => setShowAddMovie(true);

  if (loading) {
    return (
      <main className="cine-loading-screen">
        <span className="cine-loading-mark">CL<span>.</span></span>
        <span className="cine-loading-caption">СОБИРАЕМ ТВОЙ КИНОАРХИВ</span>
      </main>
    );
  }

  if (!session) {
    return (
      <div className="cine-auth-shell">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <Navbar onAddMovie={openAddMovie} />
      <div className="app-main">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home movies={movies} onAddMovie={openAddMovie} />} />
            <Route path="/films" element={<Films movies={movies} onAddMovie={openAddMovie} mode="all" />} />
            <Route path="/watched" element={<Films movies={movies} onAddMovie={openAddMovie} mode="watched" />} />
            <Route path="/rated" element={<Films movies={movies} onAddMovie={openAddMovie} mode="rated" />} />
            <Route path="/watchlist" element={<Watchlist movies={movies} onAddMovie={openAddMovie} />} />
            <Route path="/timeline" element={<Timeline movies={movies} />} />
            <Route path="/statistics" element={<Statistics movies={movies} />} />
            <Route path="/together" element={<Together movies={movies} />} />
            <Route path="/recommendations" element={<Recommendations movies={movies} onAddMovie={addMovie} />} />
            <Route path="/profile" element={<Profile movies={movies} />} />
            <Route path="/movie/:id" element={<Movie movies={movies} onUpdateMovie={updateMovie} onDeleteMovie={deleteMovie} />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <footer className="cine-footer app-footer">
          <span><strong>CineLog<span className="cine-footer__dot">.</span></strong> · Твоя история кино</span>
          <span>Создано для тех, кто помнит, что чувствовал после фильма.</span>
        </footer>
      </div>
      {showAddMovie && <AddMovieModal onClose={() => setShowAddMovie(false)} onAdd={addMovie} />}
    </main>
  );
}
