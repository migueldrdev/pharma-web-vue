import { Ref, ref } from 'vue';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  AxiosInstance,
} from 'axios';
import { QSpinnerHourglass } from 'quasar';
import { api } from '@/boot/axios';
import { useNotify } from 'src/composables/useNotify';

import type { QNotifyCreateOptions } from 'quasar';

const activeDownloadNotifications: Map<string, (props: QNotifyCreateOptions) => void> = new Map();

export enum HttpMethods {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Patch = 'patch',
  Delete = 'delete',
}

export interface IHttpResourceOption {
  path: string;
  method: HttpMethods;
  slug?: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  paramsRoute?: unknown[];
  data?: Record<string, unknown> | FormData;
  timeout?: number;
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text';
  download?: boolean;
  nameDocument?: string;
  downloadJson?: boolean;
  // Puedes añadir un flag para indicar si requiere token Bearer si no es Sanctum
  requiresBearerToken?: boolean;
}

// Tipo genérico para la propiedad 'data'
export interface IHttpResponse<TData = unknown> {
  responseCode: string;
  code?: number;
  responseAction: string;
  success: boolean;
  data: TData;
  title?: string;
  message: string;
  otherMessage: string;
  otherData?: unknown[];
}

export function useFetchHttp() {
  const loading: Ref<boolean> = ref(false);
  const { create: notifyCreate } = useNotify();
  let cancelTokenSource: CancelTokenSource | null = null;

  const showLoad = () => (loading.value = true);
  const hideLoad = () => (loading.value = false);

  const cancelRequest = (message = 'Solicitud cancelada por el usuario.') => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel(message);
      cancelTokenSource = null;
    }
  };

  // Esta función puede usarse para añadir un token Bearer manualmente si tu API lo requiere
  // y no es manejado por cookies (como en Sanctum SPA).
  // Para Sanctum (con withCredentials: true, withXSRFToken: true), esto NO es necesario.
  const getBearerAuthorizationHeader = () => {
    const token = localStorage.getItem('token');
    if (typeof token === 'string' && token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const fetchHttpResource = async <TData = unknown>(
    options: IHttpResourceOption,
    showLoading = true,
  ): Promise<IHttpResponse<TData>> => {
    const paramsRoute = options.paramsRoute ?? [];

    const axiosInstance = api;

    // Construye la URL relativa a la baseURL de la instancia seleccionada
    let url = `${options.path}${options.slug ?? ''}`;
    if (paramsRoute.length > 0) {
      // Asegúrate de que no haya doble barra si options.path ya termina en /
      url += `/${paramsRoute.join('/')}`;
    }

    const method = options.method;
    const headers = { ...options.headers };
    // Añade el token Bearer si la opción lo indica, para APIs que no son Sanctum SPA
    if (options.requiresBearerToken) {
      Object.assign(headers, getBearerAuthorizationHeader());
    }

    const params = options.params ?? {};
    const data = options.data ?? {};
    const timeout = options.timeout ?? 0;
    const responseType = options.download ? 'blob' : (options.responseType ?? 'json');

    // Manejo de company_id:
    // Esta lógica es un poco repetitiva y podría ser un interceptor de Axios
    // si company_id es siempre fijo para todas las peticiones a estas APIs.
    // Si company_id puede variar o depende del contexto del usuario logueado,
    // es mejor pasarlo explícitamente en options.params o options.data.
    switch (method) {
      case HttpMethods.Get:
        // params['company_id'] = 1;
        break;
      case HttpMethods.Post:
      case HttpMethods.Patch:
      case HttpMethods.Put:
      case HttpMethods.Delete:
        // if (options.data instanceof FormData) {
        //   options.data.append('company_id', '1');
        // } else {
        //   // Asegúrate de que 'data' sea un objeto para asignarle propiedades
        //   if (typeof data === 'object' && data !== null) {
        //     data['company_id'] = 1;
        //   }
        // }
        break;
      default:
        // Caso por defecto: Asume GET/POST si no se especifica
        // if (options.data instanceof FormData) {
        //   options.data.append('company_id', '1');
        // } else {
        //   if (typeof data === 'object' && data !== null) {
        //     data['company_id'] = 1;
        //   } else {
        //     params['company_id'] = 1; // Si data no es un objeto, usa params
        //   }
        // }
        break;
    }

    const axiosConfig: AxiosRequestConfig = {
      url,
      method,
      headers,
      params,
      data,
      timeout,
      responseType,
      // `cancelToken` se considera legacy. `signal` con `AbortController` es lo moderno.
      // Si usas AbortController:
      // signal: abortController.signal,
    };

    if (options.download) {
      const notificationId = `download-${Date.now()}`;
      const updatingNotification = notifyCreate({
        group: false,
        spinner: QSpinnerHourglass,
        type: 'ongoing',
        color: 'primary',
        position: 'bottom-right',
        timeout: 0,
        spinnerSize: '0.6em',
        message: 'Descargando archivo...',
      });
      activeDownloadNotifications.set(notificationId, updatingNotification);

      try {
        const axiosResponse = await axiosInstance(axiosConfig);
        return (await downloadResource(
          axiosResponse,
          axiosResponse.headers['file-name'] ?? options.nameDocument ?? 'download',
          options.downloadJson ?? false,
          notificationId,
        )) as unknown as IHttpResponse<TData>;
      } catch (err: unknown) {
        const finalNotification = activeDownloadNotifications.get(notificationId);
        if (finalNotification) {
          finalNotification({
            icon: 'mdi-download-off',
            color: 'red',
            message: 'Error al descargar el archivo.',
            position: 'bottom-right',
            timeout: 2500,
          });
          activeDownloadNotifications.delete(notificationId);
        }
        throw err;
      }
    }

    return handleRequest<TData>(axiosInstance, axiosConfig, showLoading);
  };

  const handleRequest = async <TData = unknown>(
    axiosInstance: AxiosInstance,
    axiosConfig: AxiosRequestConfig,
    showLoading: boolean,
  ): Promise<IHttpResponse<TData>> => {
    if (showLoading) showLoad();
    try {
      const response = await axiosInstance(axiosConfig);
      return response.data as IHttpResponse<TData>;
    } catch (err: unknown) {
      return (await catchAxiosError(err)) as unknown as IHttpResponse<TData>;
    } finally {
      if (showLoading) hideLoad();
    }
  };

  // Manejador de errores
  const catchAxiosError = (err: unknown): Promise<IHttpResponse<unknown>> => {
    const defaultResponse: IHttpResponse<unknown> = {
      responseCode: 'IKERR',
      responseAction: '',
      success: false,
      data: [],
      message: 'Ha sucedido un inconveniente en la solicitud HTTP',
      otherMessage: '',
      otherData: [],
    };

    // axios.isAxiosError es un type guard
    if (axios.isAxiosError(err)) {
      const errorResponse = (err.response?.data as IHttpResponse<unknown>) ?? defaultResponse;

      // AxiosError tiene una propiedad `code` para errores de red o de cancelación
      if (err.code === AxiosError.ERR_NETWORK) {
        return onNetworkError();
      }

      if (err.response?.status === 404) {
        return onNotFound(err.response);
      }

      if (err.response) {
        return Promise.resolve(errorResponse);
      }

      if (err.message === 'Solicitud cancelada.') {
        return Promise.resolve({
          ...defaultResponse,
          message: err.message,
          responseCode: 'IKCANC',
        });
      }

      return Promise.resolve({
        ...defaultResponse,
        message: err.message || defaultResponse.message,
      });
    }

    return Promise.resolve(defaultResponse);
  };

  const onNetworkError = (): Promise<IHttpResponse<unknown>> =>
    Promise.resolve({
      responseCode: 'IKERR',
      responseAction: '',
      success: false,
      data: [],
      message: 'Error de red, verifique su conexión a internet.',
      otherMessage: '',
      otherData: [],
    });

  const onNotFound = (response: AxiosResponse<unknown>): Promise<IHttpResponse<unknown>> =>
    Promise.resolve({
      responseCode: 'IKERR',
      responseAction: '',
      success: false,
      data: [],
      message: (response.data as { message?: string })?.message ?? 'Recurso no encontrado',
      otherMessage: '',
      otherData: [],
    });
  const downloadResource = async (
    response: AxiosResponse,
    filename: string,
    downloadJson: boolean,
    notificationId: string,
  ): Promise<IHttpResponse<unknown>> => {
    const contentType = response.headers['content-type'];
    const finalNotification = activeDownloadNotifications.get(notificationId);

    if (!response || response.status < 200 || response.status >= 300) {
      if (finalNotification) {
        finalNotification({
          icon: 'mdi-download-off',
          color: 'red',
          message: 'No se pudo descargar el recurso específico',
          position: 'bottom-right',
          timeout: 2500,
        });
        activeDownloadNotifications.delete(notificationId);
      }
      return {
        responseCode: 'IKERR',
        responseAction: '',
        success: false,
        data: [],
        message: 'No se pudo descargar el recurso específico',
        otherMessage: '',
        otherData: [],
      };
    }

    if (contentType?.includes('application/json') && !downloadJson) {
      try {
        const text = await new Blob([response.data]).text();
        const parsed: IHttpResponse<unknown> = JSON.parse(text);

        if (!parsed.success) {
          // Si el JSON indica un error
          if (finalNotification) {
            finalNotification({
              icon: 'mdi-download-off',
              color: 'red',
              message: parsed.message || 'Fallo en la descarga (error de API)',
              position: 'bottom-right',
              timeout: 2500,
            });
            activeDownloadNotifications.delete(notificationId);
          }
          return parsed; // Retorna la respuesta de error de la API
        }
      } catch (jsonError) {
        // No era un JSON de error, o el JSON es inválido, procede como binario
        console.warn(
          'Expected JSON response for download was not a valid error object, proceeding with binary download.',
          jsonError,
        );
      }
    }

    // Procede con la descarga binaria
    const blob = new Blob([response.data], { type: contentType ?? 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    if (finalNotification) {
      finalNotification({
        icon: 'mdi-check-circle',
        spinner: false,
        message: '¡Descarga completa!',
        color: 'primary',
        position: 'bottom-right',
        timeout: 2500,
      });
      activeDownloadNotifications.delete(notificationId);
    }

    return {
      responseCode: 'IKSUC',
      responseAction: '',
      success: true,
      data: [], // No hay datos de respuesta en una descarga binaria exitosa
      message: 'Descarga realizada',
      otherMessage: '',
      otherData: [],
    };
  };

  return {
    loading,
    fetchHttpResource,
    cancelRequest,
  };
}
