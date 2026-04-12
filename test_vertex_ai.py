import os
from anthropic import AnthropicVertex

def test_vertex():
    print("Testing connection to Vertex AI...")
    try:
        # Vertex AI klients automātiski paņems ADC akreditācijas datus, ko izveidojām iepriekš
        client = AnthropicVertex(
            project_id="home-os-492805",
            region="europe-west1"
        )
        
        message = client.messages.create(
            # Vertex AI prasa precīzu modeļa nosaukumu no Model Garden.
            # claude-3-5-sonnet@20240620 ir standarta Vertex formāts (Claude 3.5 Sonnet)
            model="claude-3-5-sonnet@20240620", 
            max_tokens=256,
            messages=[
                {"role": "user", "content": "Hello, can you hear me through Vertex AI? Answer with a short YES."}
            ]
        )
        print("\nSuccess! Claude replied:")
        print(message.content[0].text)
        
    except Exception as e:
        print(f"\nError occurred: {str(e)}")

if __name__ == "__main__":
    test_vertex()
