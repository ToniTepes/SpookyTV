
//console.log("SpookyTV is awake. Happy haunting!");


const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#show-search");
const searchButton = document.querySelector("#search-button");
const statusMessage = document.querySelector("#status-message");
const resultsList = document.querySelector("#results-list");

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        return;
    }

    resultsList.replaceChildren();
    statusMessage.textContent = "Searching for your show...";
    searchButton.disabled = true;

    try {
        const response = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("The show search failed.");
        }

        const matches = await response.json();

        if (matches.length === 0) {
            statusMessage.textContent =
                "No shows found. Try another title.";
            return;
        }

        statusMessage.textContent =
            "Choose the correct show:";

        matches.slice(0, 5).forEach((match) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "episode-card";
            button.textContent = match.show.name;

            button.addEventListener("click", () => {
                loadEpisodes(match.show);
            });

            resultsList.appendChild(button);
        });
    } catch (error) {
        statusMessage.textContent =
            "Something went wrong. Please try again.";
        console.error(error);
    } finally {
        searchButton.disabled = false;
    }
});

async function loadEpisodes(show) {
    resultsList.replaceChildren();
    statusMessage.textContent =
        `Loading episodes for ${show.name}...`;

    try {
        const response = await fetch(
            `https://api.tvmaze.com/shows/${show.id}/episodes?specials=1`
        );

        if (!response.ok) {
            throw new Error("The episode request failed.");
        }

        const episodes = await response.json();

        const halloweenEpisodes = episodes.filter(isHalloweenEpisode);

        statusMessage.textContent =
            `${show.name}: ${halloweenEpisodes.length} Halloween episodes found! FUCK YEAH!`;

        halloweenEpisodes.forEach((episode) => {
            const card = document.createElement("article");
            card.className = "episode-card";

            const title = document.createElement("h3");
            title.textContent = episode.name;

            const meta = document.createElement("p");
            meta.className = "episode-meta";

            const season = episode.season ?? "Special";
            const number = episode.number ?? "N/A";

            meta.textContent =
                `Season ${season} · Episode ${number}`;

            card.append(title, meta);
            resultsList.appendChild(card);
        });
    } catch (error) {
        statusMessage.textContent =
            "Couldn't load the episodes. Please try again.";
        console.error(error);
    }
}


function isHalloweenEpisode(episode) {
    const title = episode.name ?? "";
    const summary = episode.summary ?? "";

    const clues = [
        "halloween",
        "terror tales of the park",
        "trick or treat",
        "haunted house",
        "costume party",
        "jack-o-lantern",
        "jack o lantern",
        "all hallows",
        "spooky"
    ];

    const episodeText = `${title} ${summary}`
        .toLowerCase()
        .replace(/<[^>]*>/g, " ");

    return clues.some((clue) => episodeText.includes(clue));
}

