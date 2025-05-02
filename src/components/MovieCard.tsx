import React from 'react';
import { Movie } from '../services/kinopoiskApi';
import '../styles/MovieCard.css';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const posterUrl = movie.poster?.url || 
                    movie.poster?.previewUrl || 
                    'https://via.placeholder.com/300x450?text=Нет+изображения';
  const rating = movie.rating?.kp ? movie.rating.kp.toFixed(1) : 'Н/Д';
  const genres = movie.genres?.map(genre => genre.name).join(', ') || 'Жанр не указан';

  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img src={posterUrl} alt={movie.name} loading="lazy" />
        {movie.rating?.kp && (
          <div className="movie-rating">
            <span>{rating}</span>
          </div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title" title={movie.name}>
          {movie.name}
        </h3>
        {movie.alternativeName && (
          <div className="movie-alt-name">{movie.alternativeName}</div>
        )}
        {movie.year && <div className="movie-year">{movie.year} г.</div>}
        <div className="movie-genres" title={genres}>
          {genres}
        </div>
      </div>
    </div>
  );
};

export default MovieCard; 