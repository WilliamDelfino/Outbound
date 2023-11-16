let map;
      let infowindow;
      let markers = [];

      function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: -33.866, lng: 151.196 },
          zoom: 15,
        });

        infowindow = new google.maps.InfoWindow();

        const searchButton = document.getElementById("searchButton");
        searchButton.addEventListener("click", () => {
          const city = document.getElementById("cityInput").value;
          const keywords = document.getElementById("keywordsInput").value;
          searchPlaces(city, keywords);
        });
      }

      function searchPlaces(city, keywords) {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: city }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results[0].geometry) {
            map.setCenter(results[0].geometry.location);
            const request = {
              location: results[0].geometry.location,
              radius: 10000, // 10 km radius
              query: keywords ? `${keywords} in ${city}` : `estabelecimentos in ${city}`,
              fields: ["name", "formatted_address", "place_id", "geometry", "rating", "user_ratings_total"],
            };

            const service = new google.maps.places.PlacesService(map);

            service.textSearch(request, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                const filteredResults = results.filter(
                  place => place.rating > 4.5 && place.user_ratings_total > 70
                );

                if (filteredResults.length > 0) {
                  criarLista(filteredResults);
                  adicionarMarcadores(filteredResults);
                } else {
                  alert("Nenhum estabelecimento encontrado com os critérios especificados.");
                }
              } else {
                alert("Erro ao buscar estabelecimentos: " + status);
              }
            });
          } else {
            alert("Erro ao geocodificar a cidade: " + status);
          }
        });
      }

      function criarLista(estabelecimentos) {
        const listaElement = document.getElementById("listaEstabelecimentos");
        listaElement.innerHTML = ""; // Limpa a lista

        estabelecimentos.forEach(place => {
          const listItem = document.createElement("li");
          listItem.textContent = `${place.name} - Avaliação: ${place.rating}, Avaliações: ${place.user_ratings_total}`;
          listaElement.appendChild(listItem);
        });
      }

      function adicionarMarcadores(estabelecimentos) {
        // Limpa marcadores existentes
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        // Adiciona novos marcadores
        estabelecimentos.forEach(place => {
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
          });

          google.maps.event.addListener(marker, "click", () => {
            infowindow.setContent(place.name);
            infowindow.open(map, marker);
          });

          markers.push(marker);
        });
      }

      window.initMap = initMap;
