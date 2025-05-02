const API_KEY = 'HJ6E8NG-TSEM526-MCG116Z-7Y9Z5RX';
const BASE_URL = 'https://api.kinopoisk.dev';

export interface Movie {
  id: number;
  name: string;
  alternativeName?: string;
  poster?: {
    url: string;
    previewUrl: string;
  };
  rating?: {
    kp: number;
    imdb: number;
  };
  year?: number;
  genres?: { name: string }[];
  countries?: { name: string }[];
  description?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ApiResponse<T> {
  docs: T[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

class KinopoiskApi {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async fetchData<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Создаем базовый URL с учетом версии API 1.4
    const baseEndpoint = endpoint.startsWith('v1.4') ? endpoint : endpoint;
    let url = `${this.baseUrl}/${baseEndpoint}`;
    
    // Формирование URL с параметрами
    if (Object.keys(params).length > 0) {
      // Для правильной обработки повторяющихся параметров (например, multiple genres.name)
      // нам нужно помнить, что в URL-запросе должны быть отдельные параметры:
      // например: genres.name=+комедия&genres.name=+драма
      
      // Создаем массив для хранения пар ключ-значение
      const queryParts: string[] = [];
      
      // Массив для отслеживания повторяющихся ключей
      const multipleKeys: Record<string, boolean> = {};
      
      // Обрабатываем параметры, формируя массив частей запроса
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          // Если значение - массив, каждый элемент становится отдельным параметром
          if (Array.isArray(value)) {
            // Отмечаем ключ как множественный
            multipleKeys[key] = true;
            
            value.forEach(item => {
              const encodedKey = encodeURIComponent(key);
              const encodedValue = encodeURIComponent(String(item));
              queryParts.push(`${encodedKey}=${encodedValue}`);
            });
          } else {
            // Если ключ уже был добавлен как множественный, нам нужно использовать
            // тот же формат для всех значений с этим ключом
            const encodedKey = encodeURIComponent(key);
            
            // Обработка специальных символов для жанров (+ и !)
            if (typeof value === 'string' && (value.includes('%2B') || value.includes('%21'))) {
              // Сохраняем значение как есть, так как оно уже содержит закодированные символы
              queryParts.push(`${encodedKey}=${value}`);
            } else {
              // Обычное значение
              const encodedValue = encodeURIComponent(String(value));
              queryParts.push(`${encodedKey}=${encodedValue}`);
            }
          }
        }
      });
      
      // Если есть параметры, добавляем их к URL
      if (queryParts.length > 0) {
        url = `${url}?${queryParts.join('&')}`;
      }
    }
    
    console.log('API Request URL:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data as T;
    } catch (error) {
      console.error('Error fetching data from Kinopoisk API:', error);
      throw error;
    }
  }

  async getMovies(params: {
    page?: number;
    limit?: number;
    genres?: string | string[];
    search?: string;
    sortBy?: string;
    sortDirection?: 1 | -1;
  }): Promise<ApiResponse<Movie>> {
    try {
      const { genres, search, sortBy, sortDirection, ...restParams } = params;
      const queryParams: Record<string, any> = {
        ...restParams,
      };

      // Обработка параметров сортировки
      if (sortBy && sortDirection) {
        // Для API 1.4 нужен правильный формат сортировки
        queryParams.sortField = sortBy;
        queryParams.sortType = sortDirection === 1 ? 1 : -1;
      }

      // Обработка поиска
      if (search && search.trim() !== '') {
        queryParams.name = search;
      }

      // Обработка фильтрации по жанрам
      // Важно: для API 1.4 нам нужно передать genres.name параметры в правильном формате
      
      // Создаем массив параметров жанров
      const genreParams: string[] = [];
      
      if (genres && Array.isArray(genres) && genres.length > 0) {
        // Формируем параметры для каждого жанра
        genres.forEach(genre => {
          // По документации: genres.name=+жанр
          // + кодируется как %2B
          if (genre && genre.trim()) {
            genreParams.push(`genres.name=%2B${encodeURIComponent(genre.trim())}`);
          }
        });
      } else if (genres && typeof genres === 'string' && genres.trim() !== '') {
        // Для одного жанра
        genreParams.push(`genres.name=%2B${encodeURIComponent(genres.trim())}`);
      }
      
      // Собираем полный URL с параметрами
      let url = `${this.baseUrl}/v1.4/movie`;
      
      // Добавляем основные параметры
      const basicParams = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      if (basicParams) {
        url += `?${basicParams}`;
      }
      
      // Добавляем параметры жанров
      if (genreParams.length > 0) {
        url += (basicParams ? '&' : '?') + genreParams.join('&');
      }
      
      console.log('Полный URL запроса фильмов:', url);
      
      // Выполняем запрос напрямую, минуя стандартный fetchData
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Ответ API фильмов:', data);
      
      if (!data || !data.docs) {
        console.error('Некорректный формат ответа API:', data);
        return { docs: [], total: 0, limit: 0, page: 0, pages: 0 };
      }
      
      return data as ApiResponse<Movie>;
    } catch (error) {
      console.error('Ошибка при получении фильмов:', error);
      return { docs: [], total: 0, limit: 0, page: 0, pages: 0 };
    }
  }

  async getGenres(): Promise<ApiResponse<Genre>> {
    try {
      // Запрос на получение списка жанров
      const response = await this.fetchData<any>('v1/movie/possible-values-by-field', {
        field: 'genres.name',
      });
      
      console.log('Оригинальный ответ жанров:', response);
      
      // Преобразование ответа в ожидаемый формат
      if (response) {
        let genres: Genre[] = [];
        
        // На скриншоте видно, что API возвращает массив объектов с name и slug
        if (Array.isArray(response) && response.length > 0) {
          // Проверяем первый элемент на наличие структуры {name, slug}
          if (response[0] && response[0].name && response[0].slug) {
            // Преобразуем в нужный формат с id и name
            genres = response.map((item, index) => ({
              id: index,
              name: item.name
            }));
            console.log('Преобразованные жанры из {name, slug}:', genres);
          } else {
            // Если другой формат, обрабатываем как простой массив строк
            genres = response.map((name, index) => ({
              id: index,
              name: typeof name === 'string' ? name : String(name)
            }));
          }
        } else if (response.docs && Array.isArray(response.docs)) {
          genres = response.docs;
        } else if (typeof response === 'object') {
          // Если ответ - объект, пытаемся извлечь данные
          const values = Object.values(response);
          if (values.length > 0 && Array.isArray(values[0])) {
            genres = values[0].map((item, index) => {
              if (typeof item === 'object' && item && item.name) {
                return { id: index, name: item.name };
              }
              return { id: index, name: String(item) };
            });
          }
        }
        
        console.log('Итоговые преобразованные жанры:', genres);
        
        // Возвращаем данные в ожидаемом формате
        return {
          docs: genres,
          total: genres.length,
          limit: genres.length,
          page: 1,
          pages: 1
        };
      }
      
      // Если ответ пустой, возвращаем пустой массив
      return { docs: [], total: 0, limit: 0, page: 0, pages: 0 };
    } catch (error) {
      console.error('Ошибка при получении жанров:', error);
      return { docs: [], total: 0, limit: 0, page: 0, pages: 0 };
    }
  }
}

export const kinopoiskApi = new KinopoiskApi(API_KEY, BASE_URL); 