import React, { useState, useEffect } from 'react';
import { kinopoiskApi, Movie, Genre } from './services/kinopoiskApi';
import MovieList from './components/MovieList';
import GenreFilter from './components/GenreFilter';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import './styles/App.css';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('rating.kp');
  const [sortDirection, setSortDirection] = useState<-1 | 1>(-1);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const [isGenresLoading, setIsGenresLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка жанров
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsGenresLoading(true);
        console.log('Запрос на получение жанров...');
        const response = await kinopoiskApi.getGenres();
        console.log('Ответ API жанров:', response);
        
        // Проверка, что response.docs существует и является массивом
        if (response && response.docs && Array.isArray(response.docs)) {
          const filteredGenres = response.docs.filter(genre => 
            genre && typeof genre.name === 'string' && genre.name.trim() !== ''
          );
          console.log('Отфильтрованные жанры:', filteredGenres);
          setGenres(filteredGenres);
        } else {
          console.error('Некорректный ответ API жанров:', response);
          setGenres([]);
          setError('Получен некорректный ответ при загрузке жанров');
        }
      } catch (err) {
        console.error('Ошибка при загрузке жанров:', err);
        setError('Не удалось загрузить жанры');
        setGenres([]);
      } finally {
        setIsGenresLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Загрузка фильмов с учетом фильтрации
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsMoviesLoading(true);
        setError(null);

        const params: any = {
          page: currentPage,
          limit: 10,
        };

        // Обновленный формат сортировки
        if (sortBy) {
          params.sortField = sortBy;
          params.sortType = sortDirection;
        }

        if (searchQuery) {
          params.name = searchQuery;
        }

        if (selectedGenres.length > 0) {
          params.genres = selectedGenres;
        }

        console.log('Запрос фильмов с параметрами:', params);
        const response = await kinopoiskApi.getMovies(params);
        console.log('Ответ API фильмов:', response);

        if (response && response.docs) {
          setMovies(response.docs);
          setTotalPages(response.pages);
        } else {
          console.error('Некорректный формат ответа API:', response);
          setMovies([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('Ошибка при загрузке фильмов:', err);
        setError('Не удалось загрузить фильмы');
        setMovies([]);
      } finally {
        setIsMoviesLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage, sortBy, sortDirection, searchQuery, selectedGenres]);

  // Обработчик изменения жанра
  const handleGenreChange = (genreName: string) => {
    console.log(`Изменение выбора жанра: ${genreName}`);
    setSelectedGenres((prevGenres) => {
      let newGenres;
      // Если жанр уже выбран, удаляем его, иначе добавляем
      if (prevGenres.includes(genreName)) {
        newGenres = prevGenres.filter((genre) => genre !== genreName);
        console.log(`Жанр удален: ${genreName}, новый список:`, newGenres);
      } else {
        newGenres = [...prevGenres, genreName];
        console.log(`Жанр добавлен: ${genreName}, новый список:`, newGenres);
      }
      return newGenres;
    });
    // Сбрасываем страницу при изменении фильтров
    setCurrentPage(1);
  };

  // Обработчик поиска
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Обработчик изменения сортировки
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    
    if (value === 'rating') {
      setSortBy('rating.kp');
      setSortDirection(-1);
    } else if (value === 'year') {
      setSortBy('year');
      setSortDirection(-1);
    } else if (value === 'name') {
      setSortBy('name');
      setSortDirection(1);
    }
    
    setCurrentPage(1);
    console.log(`Сортировка изменена: поле=${value === 'rating' ? 'rating.kp' : value}, направление=${value === 'name' ? 1 : -1}`);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Каталог фильмов</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <aside className="app-sidebar">
            <GenreFilter
              genres={genres}
              selectedGenres={selectedGenres}
              onGenreChange={handleGenreChange}
              isLoading={isGenresLoading}
            />
          </aside>

          <div className="app-content">
            <div className="sort-controls">
              <label htmlFor="sort-select">Сортировать по:</label>
              <select
                id="sort-select"
                value={
                  sortBy === 'rating.kp' 
                    ? 'rating' 
                    : sortBy === 'year' 
                    ? 'year' 
                    : 'name'
                }
                onChange={handleSortChange}
              >
                <option value="rating">Рейтингу</option>
                <option value="year">Году</option>
                <option value="name">Названию</option>
              </select>
            </div>

            <MovieList
              movies={movies}
              isLoading={isMoviesLoading}
              error={error}
            />

            {!isMoviesLoading && !error && totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2025 Каталог фильмов</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
