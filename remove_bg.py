import argparse
from PIL import Image
from rembg import remove


def remover_fondo(ruta_entrada, ruta_salida):
    # Abrir la imagen de entrada
    imagen = Image.open(ruta_entrada)
    # Remover el fondo de la imagen
    imagen_sin_fondo = remove(imagen)
    # Guardar la imagen resultante
    imagen_sin_fondo.save(ruta_salida)
    print(f"Imagen guardada en: {ruta_salida}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Script para remover el fondo de una imagen')
    parser.add_argument('-i', '--input', type=str, required=True, help='Ruta a la imagen de entrada')
    parser.add_argument('-o', '--output', type=str, required=True, help='Ruta para guardar la imagen resultante')
    args = parser.parse_args()

    remover_fondo(args.input, args.output)
