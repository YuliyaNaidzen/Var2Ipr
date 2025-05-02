import React from 'react';
import { Genre } from '../services/kinopoiskApi';
import '../styles/GenreFilter.css';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenres: string[];
  onGenreChange: (genreName: string) => void;
  isLoading: boolean;
}

const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  selectedGenres,
  onGenreChange,
  isLoading,
}) => {
  // Отладочная информация
  console.log('GenreFilter рендер:', { 
    genres: genres?.length, 
    isLoading, 
    selectedGenres 
  });
  
  if (isLoading) {
    return <div className="genre-loader">Загрузка жанров...</div>;
  }
  
  // Проверим, что жанры существуют и имеют корректный формат
  if (!genres || !Array.isArray(genres)) {
    console.error('Некорректный формат жанров:', genres);
    return <div className="no-genres">Ошибка формата данных жанров</div>;
  }

  return (
    <div className="genre-filter">
      <h2>Фильтр по жанрам</h2>
      {genres.length === 0 ? (
        <div className="no-genres">Жанры не найдены. Проверьте соединение с API.</div>
      ) : (
        <div className="genres-list">
          {genres.map((genre) => (
            <div
              key={genre.id || genre.name}
              className={`genre-item ${selectedGenres.includes(genre.name) ? 'selected' : ''}`}
            >
              <label>
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre.name)}
                  onChange={() => {
                    console.log(`Жанр выбран: ${genre.name}`);
                    onGenreChange(genre.name);
                  }}
                />
                <span>{genre.name}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreFilter; 