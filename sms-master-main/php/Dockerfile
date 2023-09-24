FROM php:8.1.0-fpm


RUN apt-get update && apt-get install -y \
        curl \
        libyaml-dev \
        libonig-dev \
        zip \
        unzip \
        procps \
        && pecl install yaml \
        && docker-php-ext-enable yaml \
        && docker-php-ext-install -j$(nproc) mbstring pdo_mysql \
        && docker-php-ext-configure pcntl --enable-pcntl \
        && docker-php-ext-install pcntl \
        && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ADD php.ini /usr/local/etc/php/conf.d/40-custom.ini

WORKDIR /var/www/html/api

EXPOSE 9000


# CMD ["php-fpm"]