import React from 'react';
import MovieCard from './MovieCard';
import { Movie } from '../services/kinopoiskApi';
import '../styles/MovieList.css';

interface MovieListProps {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
}

const MovieList: React.FC<MovieListProps> = ({ movies, isLoading, error }) => {
  if (error) {
    return <div className="error-message">Ошибка: {error}</div>;
  }

  if (isLoading) {
    return <div className="loader">Загрузка фильмов...</div>;
  }
  
  // Проверяем, что movies - это массив
  if (!movies || !Array.isArray(movies)) {
    return <div className="error-message">Ошибка: некорректные данные фильмов</div>;
  }

  if (movies.length === 0) {
    return <div className="no-results">Фильмы не найдены. Попробуйте изменить параметры поиска.</div>;
  }

  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList; 