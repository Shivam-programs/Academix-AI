import json


class ResponseParser:
    @staticmethod
    def parse_json(response: str) -> dict:
        """
        Parse the JSON response from the LLM.
        """
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON returned by the LLM: {e}")